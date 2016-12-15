"use strict";

var checks = require('./teams/checks.js')
var sortings = require('../general/sortings.js')
var matchings = require('./teams/matchings.js')
var strict_matchings = require('./teams/strict_matchings.js')
var sys = require('./sys.js')
var tools = require('../general/tools.js')
var math = require('../general/math.js')
var filters = require('./teams/filters.js')
var loggers = require('../general/loggers.js')

function get_team_ranks_original(r, teams, compiled_team_results, filter_functions, __) {
    loggers.silly_logger(get_team_ranks_original, arguments, 'allocations', __filename)
    var ranks = {}

    for (let team of teams) {
        let others = teams.filter(other => team.id !== other.id)
        others.sort(sortings.sort_decorator(team, filter_functions, {r: r, compiled_team_results: compiled_team_results}))

        ranks[team.id] = others.map(o => o.id)
    }
    return ranks
}

function integrate_filter_functions(team, filter_functions, weights, dict) {
    loggers.silly_logger(integrate_filter_functions, arguments, 'allocations', __filename)
    function f(a, b) {
        let a_val = 0
        let c = 0
        for (let func of filter_functions) {
            a_val += weights[c] * func(team, a, b, dict)
            c += 1
        }
        return a_val > 0 ? 1 : (a_val < 0) ? -1 : 0
    }
    return f
}

function get_team_ranks_straight(r, teams, compiled_team_results, filter_functions, __) {
    loggers.silly_logger(get_team_ranks_straight, arguments, 'allocations', __filename)
    var ranks = {}
    let weights = Array(filter_functions.length).fill(1)

    for (let team of teams) {
        let others = teams.filter(other => team.id !== other.id)
        others.sort(integrate_filter_functions(team, filter_functions, weights, {r: r, compiled_team_results: compiled_team_results}))

        ranks[team.id] = others.map(o => o.id)
    }
    return ranks
}

function get_team_ranks_weighted(r, teams, compiled_team_results, filter_functions, __) {
    loggers.silly_logger(get_team_ranks_weighted, arguments, 'allocations', __filename)
    var ranks = {}
    let weights = Array(filter_functions.length).map((x, i) => 1/(i+1))

    for (let team of teams) {
        let others = teams.filter(other => team.id !== other.id)
        others.sort(integrate_filter_functions(team, filter_functions, weights, {r: r, compiled_team_results: compiled_team_results}))

        ranks[team.id] = others.map(o => o.id)
    }
    return ranks
}

function get_team_ranks_custom(r, teams, compiled_team_results, filter_functions, weights) {
    loggers.silly_logger(get_team_ranks_custom, arguments, 'allocations', __filename)
    var ranks = {}

    for (let team of teams) {
        let others = teams.filter(other => team.id !== other.id)
        others.sort(integrate_filter_functions(team, filter_functions, weights, {r: r, compiled_team_results: compiled_team_results}))

        ranks[team.id] = others.map(o => o.id)
    }
    return ranks
}

function get_team_allocation_from_matching(matching, compiled_team_results, config) {
    loggers.silly_logger(get_team_allocation_from_matching, arguments, 'allocations', __filename)
    var remaining = []
    for (var key in matching) {
        remaining.push(parseInt(key))
        remaining = remaining.concat(matching[key])
    }
    var team_allocation = []
    var id = 0
    for (var key in matching) {
        if (remaining.length === 0) {
            break
        }
        let square = {
            id: id,
            chairs: [],
            panels: [],
            trainees: [],
            venue: null
        }

        /*
        select the least one sided positions
         */

        let teams = matching[key]
        teams.push(parseInt(key))

        square.teams = sys.decide_positions(teams, compiled_team_results, config)

        team_allocation.push(square)

        for (var team of teams) {
            remaining = remaining.filter(id => id !== team)
        }
        id += 1
    }
    return team_allocation
}

//console.log(get_team_allocation_from_matching({1: [2, 3, 4]}, [{id: 1}, {id: 2}, {id: 3}, {id: 4}], [{id: 1, past_sides: ['og', 'oo', 'cg']}, {id: 2, past_sides: ['og', 'oo']}, {id: 3, past_sides: []}, {id: 4, past_sides: []}]))
//console.log(get_team_allocation_from_matching({1: [2], 3: [4]}, [{id: 1, past_sides: ['og', 'oo', 'cg']}, {id: 2, past_sides: ['og', 'oo']}, {id: 3, past_sides: []}, {id: 4, past_sides: []}]))

/*

Main functions

*/

let get_team_ranks_methods = {
    'original': get_team_ranks_original,
    'straight': get_team_ranks_straight,
    'weighted': get_team_ranks_weighted,
    'custom': get_team_ranks_custom
}

function get_team_allocation (r, teams, compiled_team_results, {filters: filters=['by_strength', 'by_side', 'by_past_opponent', 'by_institution', 'by_random'], method: method='straight', weights: weights=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, config) {//GS ALGORITHM BASED//
    loggers.allocations('get_team_allocation is called')
    loggers.allocations('debug', 'arguments are: '+JSON.stringify(arguments))
    var filter_functions = filters.map(f => filter_methods[f])
    var available_teams = tools.filter_available(teams, r)
    var sorted_teams = sortings.sort_teams(available_teams, compiled_team_results)
    var ts = sorted_teams.map(t => t.id)
    const ranks = get_team_ranks_methods[method](r, sorted_teams, compiled_team_results, filter_functions, weights)
    var team_num = config.style.team_num
    var matching = matchings.m_gale_shapley(ts, ranks, team_num-1)
    var team_allocation = get_team_allocation_from_matching(matching, compiled_team_results, config)
    return team_allocation
}

function get_team_allocation_from_strict_matching(matching) {
    loggers.silly_logger(get_team_allocation_from_strict_matching, arguments, 'allocations', __filename)
    var id = 0
    var allocation = []
    for (var div of matching) {
        let square = {
            id: id,
            teams: div,
            chairs: [],
            panels: [],
            trainees: [],
            venue: null
        }
        allocation.push(square)
        ++id
    }
    return allocation
}

function get_team_allocation_strict(r, teams, compiled_team_results, config, options) {
    loggers.allocations('get_team_allocation_strict is called')
    loggers.allocations('debug', 'arguments are: '+JSON.stringify(arguments))
    var available_teams = tools.filter_available(teams, r)
    var sorted_teams = sortings.sort_teams(available_teams, compiled_team_results)

    var matching = strict_matchings.strict_matching(teams, compiled_team_results, config, options)
    var team_allocation = get_team_allocation_from_strict_matching(matching)
    return team_allocation
}

var filter_methods = {
    by_side: filters.filter_by_side,
    by_institution: filters.filter_by_institution,
    by_past_opponent: filters.filter_by_past_opponent,
    by_strength: filters.filter_by_strength,
    by_random: filters.filter_by_random
}
//console.log(alloc)

var standard = {
    get: get_team_allocation
}

var strict = {
    get: get_team_allocation_strict
}

var precheck = checks.team_allocation_precheck

exports.standard = standard
exports.strict = strict
exports.precheck = precheck
