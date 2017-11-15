"use strict";
var sys = require('./sys.js')
var tools = require('../general/tools.js')
var sortings = require('../general/sortings.js')
var loggers = require('../general/loggers.js')
var math = require('../general/math.js')

function reset_allocation (allocation) {
    let new_allocation = allocation.map(square => Object.assign({}, square))
    for (let square of new_allocation) {
        square.venue = null
    }
    return new_allocation
}

function get_venue_draw(r, draw, venues, compiled_team_results, config, shuffle) {
    loggers.silly_logger(get_venue_draw, arguments, 'draws', __filename)
    let allocation = reset_allocation(draw.allocation)
    var available_venues = tools.filter_available(venues, r)
    var sorted_venues = shuffle ? math.shuffle(available_venues, config.name) : sortings.sort_venues(r, available_venues)
    var new_allocation = sortings.sort_allocation(allocation, compiled_team_results)

    let i = 0
    for (var square of new_allocation) {
        if (i === venues.length) {
            break
        }
        square.venue = sorted_venues[i].id
        i += 1
    }

    let new_draw = {
        r: draw.r,
        allocation: new_allocation.sort((s1, s2) => s1.venue < s2.venue ? 1 : -1)
    }
    return new_draw
}

var standard = {
    get: get_venue_draw
}

exports.standard = standard
