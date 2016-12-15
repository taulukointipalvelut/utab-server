"use strict"
var tools = require('../../general/tools.js')
var loggers = require('../../general/loggers.js')
var errors = require('../../general/errors.js')


function check_nums_of_adjudicators(teams, adjudicators, style, r, {chairs: chairs=0, panels: panels=0, trainees: trainees= 0}) {
    loggers.silly_logger(check_nums_of_adjudicators, arguments, 'allocations', __filename)
    var team_num = style.team_num
    var num_teams = tools.filter_available(teams, r).length
    var num_adjudicators = tools.filter_available(adjudicators, r).length
    let adjudicators_per_square = chairs + panels + trainees
    if (num_adjudicators < num_teams / team_num * adjudicators_per_square) {
        loggers.controllers('warn', 'too few adjudicators')
        throw new errors.NeedMore('adjudicator', Math.ceil(num_teams/team_num*adjudicators_per_square - num_adjudicators))
    }
}



function adjudicator_allocation_precheck(teams, adjudicators, institutions, style, r, numbers) {
    loggers.silly_logger(adjudicator_allocation_precheck, arguments, 'allocations', __filename)
    tools.check_detail(adjudicators, r)
    tools.check_detail(teams, r)
    check_nums_of_adjudicators(teams, adjudicators, style, r, numbers)
    //check_sublist(adjudicators, institutions, 'adjudicator', 'institutions', r)
    //check_sublist(adjudicators, teams, 'adjudicator', 'conflicts', r)
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

exports.adjudicator_allocation_precheck = adjudicator_allocation_precheck
