"use strict";
var sys = require('./sys.js')
var tools = require('../general/tools.js')
var sortings = require('../general/sortings.js')
var loggers = require('../general/loggers.js')
var checks = require('./venues/checks.js')

function get_venue_allocation(r, allocation, venues, compiled_team_results, config, shuffle) {
    loggers.silly_logger(get_venue_allocation, arguments, 'allocations', __filename)
    var available_venues = tools.filter_available(venues, r)
    var sorted_venues = sortings.sort_venues(r, available_venues)
    var new_allocation = shuffle ? math.shuffle(allocation, config.name) : sortings.sort_allocation(allocation, compiled_team_results)

    var i = 0

    for (var square of new_allocation) {
        square.venue = available_venues[i].id
        i += 1
        if (i === venues.length - 1) {
            break
        }
    }


    return new_allocation.sort((s1, s2) => s1.venue < s2.venue)
}

var standard = {
    get: get_venue_allocation
}

var precheck = checks.venue_allocation_precheck

exports.standard = standard
exports.precheck = precheck
