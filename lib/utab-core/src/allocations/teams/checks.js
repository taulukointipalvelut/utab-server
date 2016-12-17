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
}
/*
function team_allocation_results_precheck(allocation, raw_team_results, r) {//chair -> teams, panel -> teams, team -> chair
    let required_raw_team_results = []
    for (let square of allocation) {
        for (let t_id of square.teams) {
            for (let c_id of square.chairs) {
                required_raw_team_results.push({id: t_id, r: r, from_id: c_id})
            }
        }
    }
}*/
exports.team_allocation_precheck = team_allocation_precheck
