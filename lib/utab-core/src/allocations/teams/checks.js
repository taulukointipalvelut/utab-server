"use strict"
var math = require('../../general/math.js')
var tools = require('../../general/tools.js')
var loggers = require('../../general/loggers.js')
var errors = require('../../general/errors.js')

function check_nums_of_teams(teams, style, r) {
    loggers.silly_logger(check_nums_of_teams, arguments, 'allocations', __filename)
    var team_num = style.team_num
    var num_teams = tools.filter_available(teams, r).length
    if (num_teams % team_num !== 0) {
        loggers.controllers('warn', team_num - num_teams % team_num + 'more teams must be registered')
        throw new errors.NeedMore('team', team_num - num_teams % team_num)
    }
}


//check_sublist([{id: 1, institutions: [1, 2]}], [{id: 1}, {id: 2}], 'team', 'institutions')
//check_teams2debaters([{id: 1, debaters_by_r: [{r: 1, debaters: []}]}], [{id: 1}], 1)

function team_allocation_precheck(teams, institutions, style, r) {
    loggers.silly_logger(team_allocation_precheck, arguments, 'allocations', __filename)
    tools.check_detail(teams, r)
    check_nums_of_teams(teams, style, r)
    //check_sublist(teams, institutions, 'team', 'institutions', r)
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
exports.team_allocation_precheck = team_allocation_precheck
