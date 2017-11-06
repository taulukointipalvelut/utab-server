"use strict"
var math = require('../general/math')
var tools = require('../general/tools.js')
var loggers = require('../general/loggers.js')
var errors = require('../general/errors.js')

function team_results_precheck(raw_team_results, teams, r) {//TESTED
    loggers.silly_logger(team_results_precheck, arguments, 'checks', __filename)
    let available_teams = teams.filter(t => tools.access_detail(t, r).available)
    for (var team of available_teams) {
        var results = raw_team_results.filter(rdr => rdr.id === team.id && rdr.r === r)
        if (results.length === 0) { continue }
        if (results.length % 2 === 0) {
            if (results.filter(r => r.win === 1).length === results.filter(r => r.win === 0).length) {
                loggers.results('warn', 'cannot decide win of team '+team.id)
                throw new errors.WinPointsDifferent(team.name, results.map(r => r.win))
            }
        }
    }
}

exports.team_results_precheck = team_results_precheck
