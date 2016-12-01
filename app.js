"use strict";

var utab = require('./lib/utab-core/utab.js')
var controllers = require('./src/controllers.js')
var sys = require('./src/sys.js')
var bodyParser = require('body-parser')
var express = require('express')
var app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var port = process.env.PORT || 7000
var db_url = process.env.DBURL || 'mongodb://localhost/_tournaments'

/*
INITIALIZE
*/

function connect_to_each_tournament(docs) {
    let tournaments = []
    for (let doc of docs) {
        let t = new utab.Tournament({db_url: doc.db_url})
        tournaments.push({name: doc.name, db_url: doc.db_url, handler: t})
    }
    return tournaments
}

const DB = new controllers.CON({db_url: db_url})

let tournaments = []
DB.tournaments.read().then(function(docs) {
    tournaments = connect_to_each_tournament(docs)
})

/*
IMPLEMENT COMMON DATABASE API
*/

var routes = [
    {keys: ['teams']},
    {keys: ['adjudicators']},
    {keys: ['venues']},
    {keys: ['debaters']},
    {keys: ['institutions']},
    {keys: ['teams', 'debaters']},
    {keys: ['teams', 'institutions']},
    {keys: ['adjudicators', 'institutions']},
    {keys: ['adjudicators', 'conflicts']},
    {keys: ['teams', 'results']},
    {keys: ['adjudicators', 'results']},
    {keys: ['debaters', 'results']}
]

for (let route of routes) {
    app.route('/:tournament_name/'+route.keys.join('/'))
        .get(function(req, res) {//read or find//TESTED//
            let node = sys.get_node(tournaments, req.params.tournament_name, route.keys)
            node.find(req.query).then(docs => res.json(docs)).catch(err => res.status(500).json(err))
        })
        .post(function(req, res) {//create//TESTED//
            req.accepts('application/json')
            let node = sys.get_node(tournaments, req.params.tournament_name, route.keys)
            node.create(req.body).then(docs => res.json(docs)).catch(err => res.status(500).json(err))
        })
        .put(function(req, res) {//update//TESTED//
            req.accepts('application/json')
            let node = sys.get_node(tournaments, req.params.tournament_name, route.keys)
            node.update(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
        })
        .delete(function(req, res) {//delete//TESTED//
            req.accepts('application/json')
            let node = sys.get_node(tournaments, req.params.tournament_name, route.keys)
            node.delete(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
        })
}

/*
IMPLEMENT REMAINING API
*/

app.route('/tournaments')
    .get(function(req, res) {//TESTED//
        DB.tournaments.find(req.query)
        .then(docs => res.json(docs))
    })
    .post(function(req, res) {//TESTED//
        DB.tournaments.create(req.body).then(docs => res.json(docs)).catch(err => res.status(500).json(err))
    })
    .put(function(req, res) {//update
        DB.tournaments.update(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
    })
    .delete(function(req, res) {//delete
        DB.tournaments.delete(req.body).then(docs => res.json(docs)).catch(err => res.status(404).json(err))
    })



app.get('/*', function(req, res) {
    res.send('404 Not Found')
})
app.listen(port)
console.log("server started")

process.on('exit', function() {
    for (let t of tournaments) {
        t.handler.close()
    }
})
