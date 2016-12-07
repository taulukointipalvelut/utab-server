"use strict";

var winston = require('winston')
var _ = require('underscore')
var utab = require('./lib/utab-core/utab.js')
var controllers = require('./src/controllers.js')
var sys = require('./src/sys.js')
var bodyParser = require('body-parser')
var express = require('express')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

winston.configure({
    transports: [
        new (winston.transports.File) ({ level: 'silly', filename: __dirname+'/log/'+Date.now().toString()+'.log' }),
        new (winston.transports.Console) ({ level: 'silly', colorize: true })
    ]
})

const BASEURL = process.argv[2] || 'mongodb://localhost'
const DBURL = BASEURL+'/_tournaments'
const DBSTYLEURL = BASEURL+'/_styles'
const PORT = process.argv[3] || 7024

/*
INITIALIZE
*/

function respond_data(data, res) {
    let response = {data: data, errors: [], log: []}
    res.json(response)
}

function respond_error(err, res, status=500) {
    let response = {data: null, errors: [err]}
    winston.query({from: new Date - 24 * 3600 * 1000, until: new Date,limit: 10, start: 0}, function(e, d) {
        response.log = d.file
        res.status(500).json(response)
    })
}

function connect_to_each_tournament(doc) {
    let t = new utab.TournamentHandler(BASEURL+'/'+doc.id.toString())
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

function log_request(req) {
    winston.debug('['+req.method+']'+' path '+req.path+' is accessed\nQuery\n'+JSON.stringify(req.query, null, 2)+'\nRequest\n'+JSON.stringify(req.body, null, 4))
}

const DB = new controllers.CON({db_url: DBURL, db_style_url: DBSTYLEURL})
winston.info('connected to tournaments database')
let handlers = connect_to_tournaments(DB)
/*
IMPLEMENT COMMON DATABASE API
 * for entities, relations, raw results
*/

var routes = [
    {keys: ['teams'], path: '/teams', detail: true},
    {keys: ['adjudicators'], path: '/adjudicators', detail: true},
    {keys: ['venues'], path: '/venues', detail: true},
    {keys: ['debaters'], path: '/debaters', detail: true},
    {keys: ['institutions'], path: '/institutions', detail: true},
    {keys: ['teams', 'results'], path: '/teams/results/raw', detail: false},
    {keys: ['adjudicators', 'results'], path: '/adjudicators/results/raw', detail: false},
    {keys: ['debaters', 'results'], path: '/debaters/results/raw', detail: false}
]

for (let route of routes) {
    app.route('/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {//read or find//TESTED//
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.find(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .post(function(req, res) {//create//TESTED//
            log_request(req)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.create(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            }
        })
        .put(function(req, res) {//update//TESTED//
            log_request(req)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.update(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
            } else {
                node.update(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
            }
        })
        .delete(function(req, res) {//delete//TESTED//
            log_request(req)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.delete(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
            } else {
                node.delete(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
            }
        })
    if (route.detail) {
        app.route('/tournaments/:tournament_id'+route.path+'/:id')
            .get(function(req, res) {//read or find//TESTED//
                log_request(req)
                let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
                let dict = _.clone(req.body)
                dict.id = parseInt(req.params.id)
                node.findOne(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
            })
            .put(function(req, res) {//update//TESTED//
                log_request(req)
                req.accepts('application/json')
                let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
                let dict = _.clone(req.body)
                dict.id = parseInt(req.params.id)
                node.update(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
            })
            .delete(function(req, res) {//delete//TESTED//
                log_request(req)
                req.accepts('application/json')
                let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
                let dict = _.clone(req.body)
                dict.id = parseInt(req.params.id)
                node.delete(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
            })
        }
}

/*
IMPLEMENT TOURNAMENT CONFIG API
*/

app.route('/tournaments/:tournament_id')
    .get(function(req, res) {//TESTED//
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.config.read().then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
    })
    .post(function(req, res) {//TESTED//
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.config.proceed().then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        .then(th.config.read().then(doc => DB.tournaments.update(doc)))
    })
    .delete(function(req, res) {//TESTED//
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.config.rollback().then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        .then(th.config.read().then(doc => DB.tournaments.update(doc)))
    })
    .put(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.config.update(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        .then(th.config.read().then(doc => DB.tournaments.update(req.body)))
    })

/*
IMPLEMENT TOURNAMENTS API
*/

app.route('/tournaments')
    .get(function(req, res) {//TESTED//
        DB.tournaments.find(req.query)
        .then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
    })
    .post(function(req, res) {//TESTED//
        log_request(req)
        let dict = _.clone(req.body)
        if (!dict.hasOwnProperty('name')) {
            res.status(500).send()
        } else {
            let id = sys.create_hash(req.body.name)
            let db_url = BASEURL + '/'+req.body.name
            dict.id = id
            dict.db_url = db_url

            DB.tournaments.create(dict).then(doc => respond_data(doc, res))
            .then(function() {
                console.log("created")
                let id2 = id
                let th = new utab.TournamentHandler(db_url, dict)
                sys.syncadd.push({list: handlers, e: {id: id2, handler: th}})
            })
            .catch(err => respond_error(err, res))
        }
    })
    .put(function(req, res) {//update//TESTED//
        log_request(req)
        DB.tournaments.update(req.body).then(doc => respond_data(doc, res))
        .then(function() {
            let th = sys.find_tournament(handlers, req.body.id)
        })
        .catch(err => respond_error(err, res, 404))
    })
    .delete(function(req, res) {//delete//TESTED//
        log_request(req)
        DB.tournaments.delete(req.body).then(doc => respond_data(doc, res))
        .then(function () {
            let th = sys.find_tournament(handlers, req.body.id)
            th.close()
            handlers = handlers.filter(hd => hd.id !== req.body.id)
        })
        .catch(err => respond_error(err, res, 404))
    })

/*
IMPLEMENT COMPILED RESULTS API
*/

let result_routes = [
    {keys: ['teams', 'results'], path: '/teams/results'},
    {keys: ['adjudicators', 'results'], path: '/adjudicators/results'},
    {keys: ['debaters', 'results'], path: '/debaters/results'},
]

for (let route of result_routes) {
    app.route('/tournaments/:tournament_id/'+route.path)
        .get(function(req, res) {
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = _.clone(req.body)
            dict.r_or_rs = dict.rounds
            node.organize(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
}

/*
IMPLEMENT ALLOCATION API
*/

let allocation_routes = [
    {keys: ['allocations', 'teams'], path: '/allocations/teams'},
    {keys: ['allocations', 'adjudicators'], path: '/allocations/adjudicators'},
    {keys: ['allocations', 'venues'], path: '/allocations/venues'}
]

for (let route of allocation_routes) {
    app.route('/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.get(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .patch(function(req, res) {
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.check(req.body.allocation).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
        })
}

app.route('/tournaments/:tournament_id/allocations')
    .get(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        let dict = _.clone(req.query)
        dict.r = parseInt(dict.round)
        th.allocations.read(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
    })
    .post(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.allocations.create(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
    })
    .put(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, req.params.tournament_id)
        th.allocations.update(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res))
    })

    app.route('/styles')
        .get(function(req, res) {///TESTED///
            log_request(req)
            DB.styles.find(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .post(function(req, res) {///TESTED///
            log_request(req)
            req.accepts('application/json')
            DB.styles.create(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .put(function(req, res) {///TESTED///
            log_request(req)
            req.accepts('application/json')
            DB.styles.update(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
        })
        .delete(function(req, res) {///TESTED///
            log_request(req)
            req.accepts('application/json')
            DB.styles.delete(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
        })

app.get('/*', function(req, res) {
    res.status(404).send('404 Not Found')
})
app.listen(PORT)
console.log("server started")

process.on('exit', function() {
    for (let t of handlers) {
        t.handler.close()
    }
})
