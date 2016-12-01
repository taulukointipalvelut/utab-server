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

const PORT = process.env.PORT || 7001
const BASEURL = process.env.BASEURL || 'mongodb://localhost'
const DBURL = process.env.DBURL || BASEURL+'/_tournaments'

/*
INITIALIZE
*/

function connect_to_each_tournament(doc) {
    let t = new utab.TournamentHandler(BASEURL+'/'+doc.id.toString())
    return {id: doc.id, handler: t}
}

function connect_to_tournaments(DB) {
    let handlers = []
    DB.tournaments.read().then(function(docs) {
        for (let doc of docs) {
            sys.syncadd.push(handlers, connect_to_each_tournament(doc))
        }
    })
    return handlers
}

function log_request(req) {
    winston.debug('['+req.method+']'+' path '+req.path+' is accessed\nQuery\n'+JSON.stringify(req.query, null, 2)+'\nRequest\n'+JSON.stringify(req.body, null, 4))
}

const DB = new controllers.CON({db_url: DBURL})
let handlers = connect_to_tournaments(DB)
/*
IMPLEMENT COMMON DATABASE API
*/

var routes = [
    {keys: ['teams'], paths: ['teams']},
    {keys: ['adjudicators'], paths: ['adjudicators']},
    {keys: ['venues'], paths: ['venues']},
    {keys: ['debaters'], paths: ['debaters']},
    {keys: ['institutions'], paths: ['institutions']},
    {keys: ['teams', 'debaters'], paths: ['teams', 'debaters']},
    {keys: ['teams', 'institutions'], paths: ['teams', 'institutions']},
    {keys: ['adjudicators', 'institutions'], paths: ['adjudicators', 'institutions']},
    {keys: ['adjudicators', 'conflicts'], paths: ['adjudicators', 'conflicts']},
    {keys: ['teams', 'results'], paths: ['teams', 'results', 'raw']},
    {keys: ['adjudicators', 'results'], paths: ['adjudicators', 'results', 'raw']},
    {keys: ['debaters', 'results'], paths: ['debaters', 'results', 'raw']}
]

for (let route of routes) {
    app.route('/tournaments/:tournament_id/'+route.paths.join('/'))
        .get(function(req, res) {//read or find//TESTED//
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.find(req.query).then(docs => res.json(docs)).catch(err => res.status(500).json(err))
        })
        .post(function(req, res) {//create//TESTED//
            log_request(req)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.create(req.body).then(docs => res.json(docs)).catch(err => res.status(500).json(err))
        })
        .put(function(req, res) {//update//TESTED//
            log_request(req)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.update(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
        })
        .delete(function(req, res) {//delete//TESTED//
            log_request(req)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            node.delete(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
        })
}

/*
IMPLEMENT REMAINING API
*/

app.route('/tournaments/:tournament_id/rounds')
    .get(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, tournament_id)
        th.config.read().then(doc => res.json(doc)).catch(err => res.status(500).json(err))
    })
    .post(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, tournament_id)
        th.config.proceed().then(doc => res.json(doc)).catch(err => res.status(500).json(err))
    })
    .delete(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, tournament_id)
        th.config.rollback().then(doc => res.json(doc))
    })
    .patch(function(req, res) {
        log_request(req)
        let th = sys.find_tournament(handlers, tournament_id)
        th.config.extend().then(doc => res.json(doc))
    })

app.route('/tournaments')
    .get(function(req, res) {//TESTED//
        log_request(req)
        DB.tournaments.find(req.query)
        .then(docs => res.json(docs))
    })
    .post(function(req, res) {//TESTED//
        log_request(req)
        let dict = _.clone(req.body)
        let id = sys.create_hash(req.body.db_url)
        dict.id = id

        DB.tournaments.create(dict).then(docs => res.json(docs))
        .then(function() {
            let id2 = id
            let th = new utab.TournamentHandler(req.db_url, req.body)
            sys.syncadd.push(handlers, {id: id2, handler: th})
        })
        .catch(err => res.status(500).json(err))
    })
    .put(function(req, res) {//update//TESTED//
        log_request(req)
        DB.tournaments.update(req.body).then(docs => res.json(docs))
        .then(function() {
            let th = sys.find_tournament(handlers, req.body.id)
        })
        .catch(err => res.status(404).json(err))
    })
    .delete(function(req, res) {//delete//TESTED//
        log_request(req)
        DB.tournaments.delete(req.body).then(docs => res.json(docs))
        .catch(err => res.status(404).json(err))
        .then(function () {
            let th = sys.find_tournament(handlers, req.body.id)
            th.close()
            handlers = handlers.filter(hd => hd.id !== req.body.id)
        })
    })

let result_routes = [
    {keys: ['teams', 'results'], paths: ['teams', 'results']},
    {keys: ['adjudicators', 'results'], paths: ['adjudicators', 'results']},
    {keys: ['debaters', 'results'], paths: ['debaters', 'results']},
]

for (let route of result_routes) {
    app.route('/tournaments/:tournament_id/'+route.paths.join('/'))
        .get(function(req, res) {
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = _.clone(req.body)
            dict.r_or_rs = dict.rounds
            node.organize(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
        })
}

app.get('/*', function(req, res) {
    res.send('404 Not Found')
})
app.listen(PORT)
console.log("server started")

process.on('exit', function() {
    for (let t of handlers) {
        t.handler.close()
    }
})
