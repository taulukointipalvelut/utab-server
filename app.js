"use strict";

var utab = require('./lib/utab-core/utab.js')
var express = require('express')
var app = express()

var tournaments = [
    {name: 't1', db_url: ""},
    {name: 't2', db_url: ""}
]

function get_property(object, keys) {//TESTED//
    if (keys.length !== 0) {
        return get_property(object[keys[0]], keys.slice(1))
    } else {
        return object
    }
}

var routes = [
    {keys: ['teams']},
    {keys: ['adjudicators']},
    {keys: ['venues']},
    {keys: ['debaters']},
    {keys: ['institutions']},
    {keys: ['teams', 'debaters']},
    {keys: ['teams', 'institutions']},
    {keys: ['adjudicators', 'institutions']},
    {keys: ['adjudicators', 'conflicts']}
]


for (var route of routes) {
    app.get('/'+route.keys.join('/'), function(req, res) {
        res.send('hi')
    })

}




app.get('/*', function(req, res) {
    res.send('404 Not Found')
})
app.listen(8080)
