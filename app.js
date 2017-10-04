"use strict";

var winston = require('winston')
var _ = require('underscore')
var utab = require('./lib/utab-core/utab.js')
var controllers = require('./src/controllers.js')
var sys = require('./src/sys.js')
var bodyParser = require('body-parser')
var express = require('express')

const BASEURL = process.env.MONGODB_URI || 'mongodb://localhost'
const DBTOURNAMENTSURL = BASEURL+'/_tournaments'
const DBSTYLEURL = BASEURL+'/_styles'
const PORT = process.env.PORT || 80
const STATIC_PORT = process.env.PORT || 80
const PREFIX = '/api'

const app = express()
const static_app = STATIC_PORT === PORT ? app : express()

/*
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})*/
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

/*
INITIALIZE
*/

function convert_name_if_exists(dict, from, to, convert='boolean') {
    let new_dict = _.clone(dict)
    if (convert === 'boolean') {
        var f = function(x) {
            if (x === 'true') {
                return true
            } else if (x === 'false') {
                return false
            } else {
                throw new Error('Cannot parse '+x.toString()+' to boolean')
            }
        }
    } else if (convert === 'number') {
        var f = x => parseInt(x)
    } else if (convert === 'number_or_array') {
        var f = x => JSON.parse(x)
    } else {
        var f = x => x
    }
    if (dict.hasOwnProperty(from)) {
        new_dict[to] = f(dict[from])
        if (from !== to) {
            delete new_dict[from]
        }
    }
    return new_dict
}

function respond_data(data, res, stt=200) {
    let response = {data: data, errors: [], log: []}
    res.status(stt).json(response)
}

function respond_error(err, res, stt=500) {
    var response = {data: null, errors: [{name: err.name || 'InternalServerError', message: err.message || 'Unexpected Internal Server Error', code: err.code || stt, raw: err}]}

    winston.query({from: new Date - 24 * 3600 * 1000, until: new Date,limit: 10, start: 0}, function(e, d) {
        response.log = d.file
        res.status(stt).json(response)
    })
}

function connect_to_each_tournament(doc) {
    let t = new utab.TournamentHandler(BASEURL+'/'+doc.id.toString(), {id: doc.id})
    log_connection(doc.id)
    return {id: doc.id, handler: t}
}

function connect_to_tournaments(DB) {
    let handlers = []
    DB.tournaments.read().then(function(docs) {
        for (let doc of docs) {
            sys.syncadd.push({list: handlers, e: connect_to_each_tournament(doc)})
        }
    })
    return handlers
}

function log_connection(id) {
    winston.info('connected to Database of tournament id '+id.toString())
}

function log_request(req, path="?") {
    winston.debug('['+req.method+']'+' path '+req.path+' is accessed @ '+path+'\nQuery\n'+JSON.stringify(req.query, null, 2)+'\nRequest\n'+JSON.stringify(req.body, null, 4))
}

const DB = new controllers.CON({db_url: DBTOURNAMENTSURL, db_style_url: DBSTYLEURL})
winston.info('connected to tournaments database')
let handlers = connect_to_tournaments(DB)

/*
IMPLEMENT COMPILED RESULTS API
*/

let result_routes = [
    {keys: ['teams', 'results'], path: '/results/teams'},
    {keys: ['adjudicators', 'results'], path: '/results/adjudicators'},
    {keys: ['speakers', 'results'], path: '/results/speakers'},
]

for (let route of result_routes) {
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path)
        .patch(function(req, res) {
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let options = req.body.options || {}
            let rs = req.body.rs

            node.organize(rs, options).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
}

/*
IMPLEMENT RAW RESULTS API
*/

let raw_routes = [
    {keys: ['teams', 'results'], path: '/results/raw/teams', path_specified: '/rounds/:r/results/raw/teams/:id/:from_id'},
    {keys: ['adjudicators', 'results'], path: '/results/raw/adjudicators', path_specified: '/rounds/:r/results/raw/adjudicators/:id/:from_id'},
    {keys: ['speakers', 'results'], path: '/results/raw/speakers', path_specified: '/rounds/:r/results/raw/speakers/:id/:from_id'}
]

for (let route of raw_routes) {
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {//read or find//TESTED//
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.query
            node.find(dict).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .post(function(req, res) {//create//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.body
            if (Array.isArray(req.body)) {
                Promise.all(dict.map(d => node.create(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(dict).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
            }
        })
        .delete(function(req, res) {//create//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.deleteAll().then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
        })
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path_specified)
        .get(function(req, res) {//read or find//TESTED//
            log_request(req, route.path_specified)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.query
            dict.r = parseInt(req.params.r)
            dict.from_id = parseInt(req.params.from_id)
            dict.id = parseInt(req.params.id)
            node.find(dict).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .put(function(req, res) {//update//TESTED//
            log_request(req, route.path_specified)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.body
            dict.r = parseInt(req.params.r)
            dict.from_id = parseInt(req.params.from_id)
            dict.id = parseInt(req.params.id)
            node.update(dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res, 404))
        })
        .delete(function(req, res) {//delete//TESTED//
            log_request(req, route.path_specified)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.body
            dict.r = parseInt(req.params.r)
            dict.from_id = parseInt(req.params.from_id)
            dict.id = parseInt(req.params.id)
            node.delete(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
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
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path)
        .patch(function(req, res) {
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let _for = req.body.for
            if (route.require_pre_draw) {
                node.get(_for, req.body.draw, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.get(_for, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            }
        })
    app.route(PREFIX+'/tournaments/:tournament_id/rounds/:r'+route.path)
        .patch(function(req, res) {
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let r = parseInt(req.params.r)
            if (route.require_pre_draw) {
                node.get(r, req.body.draw, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.get(r, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
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
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {
            log_request(req)
            let th = sys.find_tournament(handlers, req.params.tournament_id)
            let dict = _.clone(req.query)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            th.draws.read(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        })
        .post(function(req, res) {
            log_request(req)
            let th = sys.find_tournament(handlers, req.params.tournament_id)
            let dict = _.clone(req.body)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            th.draws.create(dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res))
        })
        .put(function(req, res) {
            log_request(req)
            let th = sys.find_tournament(handlers, req.params.tournament_id)
            let dict = _.clone(req.body)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            th.draws.update(dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res))
        })
        .delete(function(req, res) {
            log_request(req)
            let th = sys.find_tournament(handlers, req.params.tournament_id)
            let dict = _.clone(req.body)
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            th.draws.delete(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
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
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {//read or find//TESTED//
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.find(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .post(function(req, res) {//create//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.create(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
            }
        })
        .delete(function(req, res) {
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.deleteAll().then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
        })
    app.route(PREFIX+'/tournaments/:tournament_id'+route.path+'/:'+route.unique)
        .get(function(req, res) {//read or find//TESTED//
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = {}
            dict[route.unique] = parseInt(req.params[route.unique])
            node.findOne(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        })
        .put(function(req, res) {//update//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = _.clone(req.body)
            dict[route.unique] = parseInt(req.params[route.unique])
            node.update(dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res, 404))
        })
        .delete(function(req, res) {//delete//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = _.clone(req.body)
            dict[route.unique] = parseInt(req.params[route.unique])
            node.delete(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
        })
}

/*
IMPLEMENT TOURNAMENT CONFIG API
*/

app.route(PREFIX+'/tournaments/:tournament_id')
    .get(function(req, res) {//TESTED//
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.config.read().then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
    })
    .put(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.config.update(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
    })
    .delete(function(req, res) {//TESTED//
        log_request(req)
        DB.tournaments.delete({id: parseInt(req.params.tournament_id)}).then(doc => respond_data(doc, res))
        .then(function () {
            let th = sys.find_tournament(handlers, parseInt(req.params.tournament_id))
            th.close()
            handlers = handlers.filter(hd => hd.id !== parseInt(req.params.tournament_id))
        })
        .catch(err => respond_error(err, res, 404))
    })

/*
IMPLEMENT TOURNAMENTS API
*/

app.route(PREFIX+'/tournaments')
    .get(function(req, res) {
        Promise.all(handlers.map(h => h.handler.config.read()))
        .then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
    })
    .post(function(req, res) {
        log_request(req)
        let dict = _.clone(req.body)
        if (!dict.hasOwnProperty('name')) {
            respond_error({code: 400, message: "Bad Request", name: "BadRequest"}, res)
        } else {
            let db_url = BASEURL + '/'+dict.id
            dict.db_url = db_url

            DB.tournaments.create({id: dict.id})
            .then(function() {
                let th = new utab.TournamentHandler(db_url, dict)
                sys.syncadd.push({list: handlers, e: {id: dict.id, handler: th}})
                respond_data(dict, res, 201)
            })
            .catch(err => respond_error(err, res))
        }
    })

app.route(PREFIX+'/styles')
    .get(function(req, res) {///TESTED///
        log_request(req)
        DB.styles.find(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
    })
    .post(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        DB.styles.create(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
    })
    /*.put(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        DB.styles.update(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res, 404))
    })
    .delete(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        DB.styles.delete(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
    })*/

app.route('/')
    .get((req, res) => res.redirect('index.html'))
static_app.use(express.static(__dirname+'/static'))

app.use(function(req, res, next){
	respond_error({name: 'NotFound', message: 'Not Found', code: 404}, res, 404)
})

app.use(function(err, req, res, next){
    respond_error({name: 'InternalServerError', message: 'Internal Server Error', code: 500}, res)
})


if (PORT !== STATIC_PORT) {
    var server = app.listen(PORT)
    var static_server = static_app.listen(STATIC_PORT)
    winston.info("api server started on port: "+PORT+", database address: "+BASEURL)
    winston.info("static server started on port: "+STATIC_PORT)
} else {
    var server = app.listen(PORT)
    winston.info("api and static server started on port: "+PORT+", database address: "+BASEURL)
}

process.on('exit', function() {
    server.close()
    static_server.close()
    for (let t of handlers) {
        t.handler.close()
        DB.close()
    }
})
