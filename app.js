"use strict";

const winston = require('winston')
const _ = require('underscore')
const Utab = require('./lib/utab-core/utab.js')
const controllers = require('./src/controllers.js')
const sys = require('./src/sys.js')
const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const randtoken = require('rand-token')
const md5 = require('blueimp-md5')

const BASEURL = process.env.MONGODB_URI || 'mongodb://localhost'
const DBTOURNAMENTSURL = BASEURL+'/_tournaments'
const DBSTYLEURL = BASEURL+'/_styles'
const DBUSERURL = BASEURL+'/_users'
const PORT = process.env.PORT || 80
const PREFIX = '/api'
const SESSIONMAXAGE = 108000000
const DATE = Date.now()

const app = express()
const api_routes = express.Router()

app.use(function (req, res, next) {
    //res.header("Access-Control-Allow-Origin", "http://localhost:8010")
    res.header("Access-Control-Allow-Origin", req.headers['origin'])
    res.header("Access-Control-Allow-Methods", req.headers['access-control-request-method'])
    res.header("Access-Control-Allow-Headers", "Authorization,Origin,X-Requested-With,Content-Type,Accept")
    res.header("Access-Control-Allow-Credentials", "true")
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        return next()
    }
})
app.use(session({
    secret: randtoken.generate(16),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: SESSIONMAXAGE
    }
}))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

winston.configure({
    transports: [
        new (winston.transports.File) ({
            level: 'silly',
            filename: __dirname+'/log/'+Date.now().toString()+'.log',
            timestamp: function() {
                let dt = new Date()
                return dt.getFullYear() +'/'+ dt.getMonth() +'/'+ dt.getDate() +' '+ dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()
            }
        }),
        new (winston.transports.Console) ({
            level: 'silly',
            colorize: true,
            timestamp: function() {
                let dt = new Date()
                return dt.getFullYear() +'/'+ dt.getMonth() +'/'+ dt.getDate() +' '+ dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()
            }
        })
    ]
})

function hash (val, random=true) {
    let date = random ? DATE : 0
    return parseInt(md5(val, date).slice(0, Number.MAX_SAFE_INTEGER.toString().length - 2), 16)
}

function drop_db_url(doc) {
    let new_doc = JSON.parse(JSON.stringify(doc))
    delete new_doc.db_url
    return new_doc
}

function respond_data(data, res, stt=200) {
    let response = {data: data, errors: [], log: []}
    res.status(stt).json(response)
}

function respond_error(err, res, stt=500) {
    winston.error(err)
    let is_mongoerror = err.name === 'MongoError'
    let response = {}
    if (!is_mongoerror) {
        response = {data: null, errors: [{name: err.name || 'InternalServerError', message: err.message || 'Unexpected Internal Server Error', code: err.code || stt, raw: err}]}
    } else {
        response = {data: null, errors: [{name: err.name, message: 'Unexpected Internal Server Error', code: err.code || stt, raw: null}]}
    }

    winston.query({from: new Date - 24 * 3600 * 1000, until: new Date,limit: 10, start: 0}, function(e, d) {
        response.log = d.file
        res.status(stt).json(response)
    })
}

function log_request(req, path="?") {
    winston.debug('['+req.method+']'+' path '+req.path+' is accessed @ '+path+'\nQuery\n'+JSON.stringify(req.query, null, 2)+'\nRequest\n'+JSON.stringify(req.body, null, 4))
}

function is_organizer (req) {
    if (req.session && ['superuser', 'organizer'].includes(req.session.usertype)) {
        return new Promise(resolve => resolve(true))
    } else {
        return new Promise(resolve => resolve(false))
    }
}

function is_administrator (req) {
    let tournament_id = req.params.tournament_id ? parseInt(req.params.tournament_id, 10) : null
    if (req.session && req.session.usertype === 'superuser') {
        return new Promise(resolve => resolve(true))
    } else if (req.session && req.session.usertype === 'organizer' && req.session.tournaments.includes(tournament_id)) {
        return new Promise(resolve => resolve(true))
    } else {
        return new Promise(resolve => resolve(false))
    }
}

function is_user_factory (usertypes, above_usertypes) {
    return function (req) {
        if (req.session && req.session.usertype === 'superuser') {
            return new Promise(resolve => resolve(true))
        } else if (req.session && above_usertypes.concat(['organizer']).includes(req.session.usertype) && req.session.tournaments.includes(parseInt(req.params.tournament_id, 10))) {
            return new Promise(resolve => resolve(true))
        } else {
            return Handler.configs.readOne(parseInt(req.params.tournament_id, 10))
                   .then(config => {
                       return usertypes.some(usertype => !config.auth[usertype].required)
                   })
        }
    }
}

let is_audience = is_user_factory(['audience'], ['speaker', 'adjudicator', 'audience'])
let is_adjudicator = is_user_factory(['adjudicator'], ['adjudicator'])
let is_speaker = is_user_factory(['speaker'], ['speaker'])
let is_adjudicator_or_speaker = is_user_factory(['adjudicator', 'speaker'], ['adjudicator', 'speaker'])

let user_error = { name: "RegisterFirst", message: "Please Login or Register", code: 401 }
let organizer_error = { name: "LoginFirst", message: "Please Login", code: 401 }

function check_factory (check_function, error=user_error) {
    return function (req, res, next) {
        check_function(req)
            .then(val => {
                if (val) {
                    return next()
                } else {
                    console.log('rejected@'+req.originalUrl)
                    respond_error(error, res, 401)
                }
            })
            .catch(() => respond_error(error, res, 401))
    }
}

let check_administrator = check_factory(is_administrator, organizer_error)
let check_organizer = check_factory(is_organizer, organizer_error)
let check_adjudicator = check_factory(is_adjudicator)
let check_speaker = check_factory(is_speaker)
let check_audience = check_factory(is_audience)
let check_adjudicator_or_speaker = check_factory(is_adjudicator_or_speaker)

/*
INITIALIZE
*/
const Handler = new Utab(DBTOURNAMENTSURL)
const ServerHandler = new controllers.CON({db_style_url: DBSTYLEURL, db_user_url: DBUSERURL})
winston.info('connected to server database')

/*
IMPLEMENT COMPILED RESULTS API
*/

let result_routes = [
    {keys: ['teams', 'results'], path: '/results/teams'},
    {keys: ['adjudicators', 'results'], path: '/results/adjudicators'},
    {keys: ['speakers', 'results'], path: '/results/speakers'},
]

for (let route of result_routes) {
    api_routes.route('/tournaments/:tournament_id'+route.path)
        .patch(check_administrator, function(req, res) {
            log_request(req, route.path)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let options = req.body.options || {}
            let rs = req.body.rs

            node.organize(tournament_id, rs, options).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
}

/*
IMPLEMENT RAW RESULTS API
*/

let raw_routes = [
    {keys: ['teams', 'results'], path: '/results/raw/teams', path_specified: '/rounds/:r/results/raw/teams/:id/:from_id', post_check_function: check_adjudicator},
    {keys: ['adjudicators', 'results'], path: '/results/raw/adjudicators', path_specified: '/rounds/:r/results/raw/adjudicators/:id/:from_id', post_check_function: check_adjudicator_or_speaker},
    {keys: ['speakers', 'results'], path: '/results/raw/speakers', path_specified: '/rounds/:r/results/raw/speakers/:id/:from_id', post_check_function: check_adjudicator}
]

for (let route of raw_routes) {
    api_routes.route('/tournaments/:tournament_id'+route.path)
        .get(check_audience, function(req, res) {//read or find//TESTED//
            let tournament_id = parseInt(req.params.tournament_id, 10)
            if (!is_administrator(req)) {
                log_request(req, route.path)
                let node = sys.get_node(Handler, route.keys)
                let dict = req.query
                node.summarize(tournament_id).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                log_request(req, route.path)
                let node = sys.get_node(Handler, route.keys)
                let dict = req.query
                node.find(tournament_id, dict).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            }
        })
        .post(route.post_check_function, function(req, res) {
            log_request(req, route.path)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = req.body
            if (Array.isArray(req.body)) {
                Promise.all(dict.map(d => node.create(tournament_id, d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(tournament_id, dict).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
            }
        })
        .delete(check_administrator, function(req, res) {//create//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = { r: parseInt(req.body.r, 10) }
            node.delete(tournament_id, dict).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
        })
    api_routes.route('/tournaments/:tournament_id'+route.path_specified)
        .get(check_administrator, function(req, res) {//read or find//TESTED//
            log_request(req, route.path_specified)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = req.query
            dict.r = parseInt(req.params.r, 10)
            dict.from_id = parseInt(req.params.from_id, 10)
            dict.id = parseInt(req.params.id, 10)
            node.find(tournament_id, dict).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .put(check_administrator, function(req, res) {//update//TESTED//
            log_request(req, route.path_specified)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = req.body
            dict.r = parseInt(req.params.r, 10)
            dict.from_id = parseInt(req.params.from_id, 10)
            dict.id = parseInt(req.params.id, 10)
            node.update(tournament_id, dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res, 404))
        })
        .delete(check_administrator, function(req, res) {//delete//TESTED//
            log_request(req, route.path_specified)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = req.body
            dict.r = parseInt(req.params.r, 10)
            dict.from_id = parseInt(req.params.from_id, 10)
            dict.id = parseInt(req.params.id, 10)
            node.deleteOne(tournament_id, dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
        })
}

/*
IMPLEMENT DRAW API1
*/

var draw_routes1 = [
    {keys: ['draws', 'teams'], path: '/draws/teams', require_pre_draw: false},
    {keys: ['draws', 'adjudicators'], path: '/draws/adjudicators', require_pre_draw: true},
    {keys: ['draws', 'venues'], path: '/draws/venues', require_pre_draw: true},
    {keys: ['draws'], path: '/draws', require_pre_draw: false}
]

for (let route of draw_routes1) {
    api_routes.route('/tournaments/:tournament_id/rounds/:r'+route.path)
        .patch(check_administrator, function(req, res) {
            log_request(req, route.path)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let r = parseInt(req.params.r, 10)
            if (route.require_pre_draw) {
                node.get(tournament_id, r, req.body.draw, req.body.options).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.get(tournament_id, r, req.body.options).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            }
        })
}

/*
IMPLEMENT DRAW API2
*/

var draw_routes2 = [
    {keys: ['draws'], path: '/draws', specify_r: false},
    {keys: ['draws'], path: '/rounds/:r/draws', specify_r: true}
]

for (let route of draw_routes2) {
    api_routes.route('/tournaments/:tournament_id'+route.path)
        .get(check_audience, function(req, res) {
            log_request(req)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let dict = _.clone(req.query)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r, 10)
            }
            Handler.draws.read(tournament_id, dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        })
        .post(check_administrator, function(req, res) {
            log_request(req)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let dict = _.clone(req.body)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r, 10)
            }
            Handler.draws.create(tournament_id, dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res))
        })
        .put(check_administrator, function(req, res) {
            log_request(req)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let dict = _.clone(req.body)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r, 10)
            }
            Handler.draws.update(tournament_id, dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res))
        })
        .delete(check_administrator, function(req, res) {
            log_request(req)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let dict = _.clone(req.body)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r, 10)
            }
            Handler.draws.deleteOne(tournament_id, dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        })
}

/*
IMPLEMENT ENTITIES, ROUNDS API
*/

var routes = [
    {keys: ['teams'], path: '/teams', unique: 'id'},
    {keys: ['adjudicators'], path: '/adjudicators', unique: 'id'},
    {keys: ['venues'], path: '/venues', unique: 'id'},
    {keys: ['speakers'], path: '/speakers', unique: 'id'},
    {keys: ['institutions'], path: '/institutions', unique: 'id'},
    {keys: ['rounds'], path: '/rounds', unique: 'r'}
]

for (let route of routes) {
    api_routes.route('/tournaments/:tournament_id'+route.path)
        .get(check_audience, function(req, res) {//read or find//TESTED//
            log_request(req, route.path)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            node.find(tournament_id, req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .post(check_administrator, function(req, res) {//create//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let force = req.query.force === 'true'
            let node = sys.get_node(Handler, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.create(tournament_id, d, force))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(tournament_id, req.body, force).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
            }
        })
        .delete(check_administrator, function(req, res) {
            log_request(req, route.path)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            node.delete(tournament_id).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
        })
    api_routes.route('/tournaments/:tournament_id'+route.path+'/:'+route.unique)
        .get(check_audience, function(req, res) {//read or find//TESTED//
            log_request(req, route.path)
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = {}
            dict[route.unique] = parseInt(req.params[route.unique], 10)
            node.findOne(tournament_id, dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        })
        .put(check_administrator, function(req, res) {//update//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = _.clone(req.body)
            dict[route.unique] = parseInt(req.params[route.unique], 10)
            node.update(tournament_id, dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res, 404))
        })
        .delete(check_administrator, function(req, res) {//delete//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let tournament_id = parseInt(req.params.tournament_id, 10)
            let node = sys.get_node(Handler, route.keys)
            let dict = _.clone(req.body)
            dict[route.unique] = parseInt(req.params[route.unique], 10)
            node.deleteOne(tournament_id, dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
        })
}

api_routes.route('/tournaments/:tournament_id/users')
    .post(check_organizer, function (req, res) {
        log_request(req)
        let usertype = ['speaker', 'adjudicator', 'audience'].includes(req.body.usertype) ? req.body.usertype : undefined
        if (usertype !== undefined) {
            ServerHandler.users.createOrUpdate({ username: req.body.username, password: req.body.password, usertype, tournaments: [parseInt(req.params.tournament_id)] })
                         .then(doc => respond_data(doc, res, 201))
                         .catch(err => respond_error(err, res))
        } else {
            respond_error({ code: 500, name: 'UsertypeNotDefined' }, res)
        }
    })

/*
IMPLEMENT TOURNAMENT CONFIG API
*/

api_routes.route('/tournaments/:tournament_id')
    .get(check_audience, function(req, res) {//TESTED//
        log_request(req)
        let tournament_id = parseInt(req.params.tournament_id, 10)
        Handler.configs.readOne(tournament_id)
            .then(doc => {
              // if (!is_administrator(req)) {
              //   delete doc.auth.adjudicator.key
              //   delete doc.auth.speaker.key
              //   delete doc.auth.audience.key
              // }
              respond_data(doc, res)
            })
            .catch(err => respond_error(err, res))
    })
    .put(check_administrator, function(req, res) {
        log_request(req)
        let tournament_id = parseInt(req.params.tournament_id, 10)
        Handler.configs.update(tournament_id, req.body)
            .then(doc => {
              respond_data(doc, res)
            })
            .catch(err => respond_error(err, res))
    })
    .delete(check_administrator, function(req, res) {//TESTED//
        log_request(req)
        let tournament_id = parseInt(req.params.tournament_id, 10)
        Handler.configs.deleteOne(tournament_id)
            .then(tournament => {
                req.session.tournaments = req.session.tournaments.filter(t => t.id !== tournament_id)
                Handler.destroy(tournament_id)
                    .then(docs => {
                        ServerHandler.users.deleteTournament({ username: req.session.username, tournament_id })
                        respond_data(tournament, res)
                    })
                    .catch(err => respond_error(err, res))
            })
    })

/*
IMPLEMENT TOURNAMENTS API
*/

api_routes.route('/tournaments')
    .get(function(req, res) {
        log_request(req)
        Handler.configs.read()
            .then(docs => docs.map(drop_db_url))
            .then(docs => respond_data(docs, res))
            .catch(err => respond_error(err, res))
    })
    .post(check_organizer, function(req, res) {
        log_request(req)
        let dict = _.clone(req.body)
        if (!dict.hasOwnProperty('name')) {
            respond_error({code: 400, message: "Tournament Name Required", name: "NameRequired"}, res)
        } else {
            dict.id = hash(dict.name, false)
            Handler.configs.create(dict)
                .then(() => {
                    req.session.tournaments.push(dict.id)
                    ServerHandler.users.addTournament({ username: req.session.username, tournament_id: dict.id })
                    respond_data(dict, res, 201)
                })
                .catch(err => respond_error(err, res))
        }
    })

api_routes.route('/styles')
    .get(function(req, res) {///TESTED///
        log_request(req)
        ServerHandler.styles.find(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
    })
    .post(check_organizer, function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        ServerHandler.styles.create(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
    })
    /*.put(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        ServerHandler.styles.update(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res, 404))
    })
    .delete(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        ServerHandler.styles.deleteOne(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
    })*/

api_routes.route('/login')
    .get(function (req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        let data = {
            username: req.session && req.session.username ? req.session.username : '',
            usertype: req.session && req.session.usertype ? req.session.usertype : '',
            tournaments: req.session && req.session.tournaments ? req.session.tournaments : []
        }
        respond_data(data, res)
    })
    .post(function (req, res) {///TESTED///
        log_request(req)
        ServerHandler.users.findOneStrict(req.body)
            .then(doc => {
                req.session.username = doc.username
                req.session.usertype = doc.usertype
                req.session.tournaments = doc.tournaments
                let data = {
                    username: doc.username,
                    usertype: doc.usertype,
                    tournaments: doc.tournaments
                }
                return respond_data(data, res)
            })
            .catch(() => respond_error({ name: "LoginFailed", message: "Incorrect Username or Password", code: 401 }, res, 401))
    })
    .delete(function (req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        req.session.destroy()
        respond_data(null, res)
    })

api_routes.route('/signup')
    .post(function (req, res) {
        log_request(req)
        ServerHandler.users.create({ username: req.body.username, password: req.body.password, usertype: 'organizer' }).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res))
    })

app.use(PREFIX, api_routes)

app.route('/')
    .get((req, res) => res.redirect('index.html'))

app.use(express.static(__dirname+'/static'))

app.use(function(req, res, next){
	respond_error({name: 'NotFound', message: 'Not Found', code: 404}, res, 404)
})

app.use(function(err, req, res, next){
    respond_error({name: 'InternalServerError', message: 'Internal Server Error', code: 500}, res)
})

let server = app.listen(PORT)
winston.info("server started on port: "+PORT+", database address: "+BASEURL)

process.on('exit', function() {
    server.close()
    Handler.close()
    ServerHandler.close()
})
