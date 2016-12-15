"use strict"

var tools = require('../general/tools.js')
var loggers = require('../general/loggers.js')
var errors = require('../general/errors.js')

function debater_results_precheck(raw_debater_results, debaters, r, team_num) {
    loggers.silly_logger(debater_results_precheck, arguments, 'checks', __filename)
    for (var debater of debaters) {
        var results = raw_debater_results.filter(rdr => rdr.id === debater.id && rdr.r === r)
        if (results.length === 0) {
            loggers.results('warn', 'results of ' + 'debater' + ': '+debater.id + ' is not sent')
            throw new errors.ResultNotSent(debater.id, 'debater', r)
        }
    }
}

function adjudicator_results_precheck(raw_adjudicator_results, adjudicators, r, team_num) {
    loggers.silly_logger(adjudicator_results_precheck, arguments, 'checks', __filename)
    for (var adjudicator of adjudicators) {
        var results = raw_adjudicator_results.filter(rar => rar.id === adjudicator.id && rar.r === r)
        if (results.length === 0) {
            loggers.results('warn', 'results of ' + 'adjudicator' + ': '+adjudicator.id + ' is not sent')
            throw new errors.ResultNotSent(adjudicator.id, 'adjudicator', r)
        }
    }
}

function team_results_precheck(raw_team_results, teams, r, team_num) {//TESTED
    loggers.silly_logger(team_results_precheck, arguments, 'checks', __filename)
    for (var team of teams) {
        var results = raw_team_results.filter(rdr => rdr.id === team.id && rdr.r === r)
        if (results.length === 0) {
            loggers.results('warn', 'results of ' + 'team' + ': '+team.id + ' is not sent')
            throw new errors.ResultNotSent(team.id, 'team', r)
        }
        if (team_num === 2) {
            if (results.length % 2 === 0) {
                if (results.filter(r => r.win === 1).length === results.filter(r => r.win === 0).length) {
                    loggers.results('warn', 'cannot decide win of team '+team.id)
                    throw new errors.WinPointsDifferent(team.id, results.map(r => r.win))
                }
            }
        } else if (team_num === 4) {
            if (results.filter(r => r.win != results[0].win).length > 0) {
                loggers.results('warn', 'the win point is not unified : '+team.id)
                throw new errors.WinPointsDifferent(team.id, results.map(r => r.win))
            }
        }
    }
}

//check_raw_debater_results([{id: 1, r: 1}, {id: 2, r: 1}], [{id: 1}, {id: 2}], 1)

//check_raw_team_results([{id: 1, r: 1, win: 1}, {id: 1, r: 1, win: 0}, {id: 2, r: 1, win: 1}], [{id: 1}, {id: 2}], 1, 2)


function results_precheck(teams, debaters, r) {
    loggers.silly_logger(results_precheck, arguments, 'checks', __filename)
    //check_sublist(teams, debaters, 'team', 'debaters', r)
    tools.check_detail(teams, r)
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

exports.debater_results_precheck = debater_results_precheck
exports.team_results_precheck = team_results_precheck
exports.adjudicator_results_precheck = adjudicator_results_precheck
exports.results_precheck = results_precheck
