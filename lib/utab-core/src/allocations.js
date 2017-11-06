"use strict";
var teams = require('./allocations/teams.js')
var adjudicators = require('./allocations/adjudicators.js')
var venues = require('./allocations/venues.js')
var sys = require('./allocations/sys.js')
var loggers = require('./general/loggers.js')

var teams = {
    precheck: teams.precheck,
    standard: teams.standard,
    strict: teams.strict
}

var adjudicators = {
    standard: adjudicators.standard,
    traditional: adjudicators.traditional
}

var venues = {
    standard: venues.standard
}

exports.teams = teams
exports.adjudicators = adjudicators
exports.venues = venues
