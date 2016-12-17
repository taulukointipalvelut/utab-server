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
app.use('/static', express.static(__dirname+'/static'))

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

const BASEURL = process.env.MONGODB_URI || 'mongodb://localhost'
const DBTOURNAMENTSURL = BASEURL+'/_tournaments'
const DBSTYLEURL = BASEURL+'/_styles'
const PORT = process.env.PORT || 7024

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
    {keys: ['teams', 'results'], path: '/teams/results'},
    {keys: ['adjudicators', 'results'], path: '/adjudicators/results'},
    {keys: ['debaters', 'results'], path: '/debaters/results'},
]

for (let route of result_routes) {
    app.route('/tournaments/:tournament_id'+route.path)
        .patch(function(req, res) {
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let options = req.body.options || {}
            let r_or_rs = req.body.r_or_rs

            node.organize(r_or_rs, options).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
}

/*
IMPLEMENT RAW RESULTS API
*/

let raw_routes = [
    {keys: ['teams', 'results'], path: '/teams/results/raw', specify_r: false},
    {keys: ['adjudicators', 'results'], path: '/adjudicators/results/raw', specify_r: false},
    {keys: ['debaters', 'results'], path: '/debaters/results/raw', specify_r: false},
    {keys: ['teams', 'results'], path: '/rounds/:r/teams/results/raw', specify_r: true},
    {keys: ['adjudicators', 'results'], path: '/rounds/:r/adjudicators/results/raw', specify_r: true},
    {keys: ['debaters', 'results'], path: '/rounds/:r/debaters/results/raw', specify_r: true}
]

for (let route of raw_routes) {
    app.route('/tournaments/:tournament_id'+route.path)
        .get(function(req, res) {//read or find//TESTED//
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.query
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            node.find(dict).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
        })
        .post(function(req, res) {//create//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.body
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            if (Array.isArray(req.body)) {
                Promise.all(dict.map(d => node.create(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(dict).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
            }
        })
        .put(function(req, res) {//update//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.body
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            if (Array.isArray(req.body)) {
                Promise.all(dict.map(d => node.update(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
            } else {
                node.update(dict).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res, 404))
            }
        })
        .delete(function(req, res) {//delete//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let dict = req.body
            if (route.specify_r) {
                dict.r = parseInt(req.params.r)
            }
            if (Array.isArray(req.body)) {
                Promise.all(dict.map(d => node.delete(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
            } else {
                node.delete(dict).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
            }
        })
}

/*
IMPLEMENT ALLOCATION API
*/

var allocation_routes = [
    {keys: ['allocations', 'teams'], path: '/allocations/teams', require_pre_allocation: false},
    {keys: ['allocations', 'adjudicators'], path: '/allocations/adjudicators', require_pre_allocation: true},
    {keys: ['allocations', 'venues'], path: '/allocations/venues', require_pre_allocation: true},
    {keys: ['allocations'], path: '/allocations', require_pre_allocation: false}
]

for (let route of allocation_routes) {
    app.route('/tournaments/:tournament_id'+route.path)
        .patch(function(req, res) {
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let _for = req.body.for
            if (route.require_pre_allocation) {
                node.get(_for, req.body.allocation, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.get(_for, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            }
        })
    app.route('/tournaments/:tournament_id/rounds/:r'+route.path)
        .patch(function(req, res) {
            log_request(req, route.path)
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            let r = parseInt(req.params.r)
            if (route.require_pre_allocation) {
                node.get(r, req.body.allocation, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.get(r, req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            }
        })
}

/*
IMPLEMENT DRAW API
*/

var draw_routes = [
    {keys: ['draws'], path: '/draws', specify_r: false},
    {keys: ['draws'], path: '/rounds/:r/draws', specify_r: true}
]

for (let route of draw_routes) {
    app.route('/tournaments/:tournament_id'+route.path)
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
    {keys: ['debaters'], path: '/debaters', unique: 'id'},
    {keys: ['institutions'], path: '/institutions', unique: 'id'},
    {keys: ['rounds'], path: '/rounds', unique: 'r'}
]

for (let route of routes) {
    app.route('/tournaments/:tournament_id'+route.path)
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
                Promise.all(req.body.map(d => node.create(d, req.query.force))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
            } else {
                node.create(req.body, req.query.force).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
            }
        })
        .put(function(req, res) {//update//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.update(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
            } else {
                node.update(req.body).then(doc => respond_data(doc, res, 201)).catch(err => respond_error(err, res, 404))
            }
        })
        .delete(function(req, res) {//delete//TESTED//
            log_request(req, route.path)
            req.accepts('application/json')
            let node = sys.get_node(handlers, req.params.tournament_id, route.keys)
            if (Array.isArray(req.body)) {
                Promise.all(req.body.map(d => node.delete(d))).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
            } else {
                node.delete(req.body).then(doc => respond_data(doc, res)).catch(err => respond_error(err, res, 404))
            }
        })
    app.route('/tournaments/:tournament_id'+route.path+'/:'+route.unique)
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

app.route('/tournaments/:tournament_id')
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

/*
IMPLEMENT TOURNAMENTS API
*/

app.route('/tournaments')
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
            let id = sys.create_hash(dict.name)
            let db_url = BASEURL + '/'+id
            dict.id = id
            dict.db_url = db_url

            DB.tournaments.create({id: id})
            .then(function() {
                let th = new utab.TournamentHandler(db_url, dict)
                sys.syncadd.push({list: handlers, e: {id: id, handler: th}})
                respond_data(dict, res, 201)
            })
            .catch(err => respond_error(err, res))
        }
    })
    .delete(function(req, res) {
        log_request(req)
        DB.tournaments.delete(req.body).then(doc => respond_data(doc, res))
        .then(function () {
            let th = sys.find_tournament(handlers, req.body.id)
            th.close()
            handlers = handlers.filter(hd => hd.id !== req.body.id)
        })
        .catch(err => respond_error(err, res, 404))
    })

app.route('/styles')
    .get(function(req, res) {///TESTED///
        log_request(req)
        DB.styles.find(req.query).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res))
    })
    .post(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        DB.styles.create(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res))
    })
    .put(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        DB.styles.update(req.body).then(docs => respond_data(docs, res, 201)).catch(err => respond_error(err, res, 404))
    })
    .delete(function(req, res) {///TESTED///
        log_request(req)
        req.accepts('application/json')
        DB.styles.delete(req.body).then(docs => respond_data(docs, res)).catch(err => respond_error(err, res, 404))
    })

app.use(function(req, res, next){
	respond_error({name: 'NotFound', message: 'Not Found', code: 404}, res, 404)
})

app.use(function(err, req, res, next){
    respond_error({name: 'InternalServerError', message: 'Internal Server Error', code: 500}, res)
})

var server = app.listen(PORT)
winston.info("server started on port: "+PORT+", database address: "+BASEURL)

process.on('exit', function() {
    server.close()
    for (let t of handlers) {
        t.handler.close()
        DB.close()
    }
})
