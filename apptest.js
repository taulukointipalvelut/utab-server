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

function respond_data(data, res, stt=200) {
    let response = {data: data, errors: [], log: []}
    res.status(stt).json(stt, response)
}

function respond_error(err, res, stt=500) {
    var response = {data: null, errors: [{name: err.name || 'InternalServerError', message: err.message || 'Unexpected Internal Server Error', code: err.code || stt}]}

    winston.query({from: new Date - 24 * 3600 * 1000, until: new Date,limit: 10, start: 0}, function(e, d) {
        response.log = d.file
        res.status(stt).json(response)
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

const DB = new controllers.CON({db_uri: DBURL, db_style_url: DBSTYLEURL})
winston.info('connected to tournaments database')
let handlers = connect_to_tournaments(DB)
/*
IMPLEMENT COMMON DATABASE API
 * for entities, relations, raw results
*/


let result_routes = [
    {keys: ['teams', 'results'], path: '/teams/results'},
    {keys: ['adjudicators', 'results'], path: '/adjudicators/results'},
    {keys: ['speakers', 'results'], path: '/speakers/results'},
]

for (let route of result_routes) {
    app.route('/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {
            log_request(req)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = _.clone(req.query)
            console.log(dict)
            if (dict.hasOwnProperty('rounds')) {
                dict.r_or_rs = dict.rounds
            }
            node.organize(dict).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
}



app.use(function(req, res, next){
	respond_error({name: 'NotFound', message: 'Not Found', code: 404}, res, 404)
})

app.use(function(err, req, res, next){
    respond_error({name: 'InternalServerError', message: 'Internal Server Error', code: 500}, res)
})

app.listen(PORT)
console.log("server started")

process.on('exit', function() {
    for (let t of handlers) {
        t.handler.close()
        DB.close()
    }
})
