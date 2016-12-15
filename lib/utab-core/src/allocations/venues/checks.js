"use strict"
var tools = require('../../general/tools.js')
var loggers = require('../../general/loggers.js')
var errors = require('../../general/errors.js')

function check_nums_of_venues(teams, venues, style, r) {
    loggers.silly_logger(check_nums_of_venues, arguments, 'allocations', __filename)
    var team_num = style.team_num
    var num_teams = tools.filter_available(teams, r).length
    var num_venues = tools.filter_available(venues, r).length
    if (num_venues < num_teams / team_num) {
        loggers.controllers('warn', 'too few venues')
        throw new errors.NeedMore('venue', Math.ceil(num_teams/team_num - num_venues))
    }
}

function venue_allocation_precheck(teams, venues, style, r) {
    loggers.silly_logger(venue_allocation_precheck, arguments, 'allocations', __filename)
    tools.check_detail(venues, r)
    tools.check_detail(teams, r)
    check_nums_of_venues(teams, venues, style, r)
}

/*console.log(check_nums(
    [{available: true, id: 1}, {available: true, id: 2}, {available: true, id: 3}, {available: true, id: 4}],
    [{available: true, id: 1}, {available: true, id: 2}],
    [{available: true, id: 1}, {available: true, id: 2}],
    {team_num: 2}
))*/
/*
console.log(check_xs2is(
    [{available: true, id: 1}, {available: true, id: 2}, {available: true, id: 3}, {available: true, id: 4}],
    [{id: 1, institutions: [0, 1]}, {id: 2, institutions: [0, 1]}, {id: 3, institutions: [0, 1]}, {id: 4, institutions: [0, 1]}],
    [{id: 0}, {id: 1}, {id: 2}, {id: 3}],
    'team',
    'institutions'
))

console.log(check_xs2is(
    [{id: 1}, {id: 2}, {id: 3}, {id: 4}],
    [{id: 1, debaters: [0, 1], r: 1}, {id: 2, debaters: [0, 1], r: 1}, {id: 3, debaters: [0, 1], r: 1}, {id: 4, debaters: [0, 1], r: 1}],
    [{id: 0}, {id: 1}, {id: 2}, {id: 3}],
    'team',
    'debaters',
    (d, id) => d.id === id && d.r === 1
))
*/
exports.venue_allocation_precheck = venue_allocation_precheck
