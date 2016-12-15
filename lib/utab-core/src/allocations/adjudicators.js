"use strict";
var sys = require('./sys.js')
var checks = require('./adjudicators/checks.js')
var tools = require('../general/tools.js')
var sortings = require('../general/sortings.js')
var math = require('../general/math.js')
var adjfilters = require('./adjudicators/adjfilters.js')
var matchings = require('./adjudicators/matchings')
var traditional_matchings = require('./adjudicators/traditional_matchings.js')
var loggers = require('../general/loggers.js')


function get_adjudicator_ranks (r, allocation, teams, adjudicators, compiled_adjudicator_results, filter_functions, filter_functions2, config) {
    loggers.silly_logger(get_adjudicator_ranks, arguments, 'allocations', __filename)
    var allocation_cp = [].concat(allocation)
    var g_ranks = {}
    var a_ranks = {}
    for (var square of allocation_cp) {
        adjudicators.sort(sortings.sort_decorator(square, filter_functions, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}))
        g_ranks[square.id] = adjudicators.map(a => a.id)
    }
    for (var adjudicator of adjudicators) {
        allocation_cp.sort(sortings.sort_decorator(adjudicator, filter_functions2, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}))
        a_ranks[adjudicator.id] = allocation_cp.map(ta => ta.id)
    }

    return [g_ranks, a_ranks]
}

function get_adjudicator_allocation_from_matching(allocation, matching, role) {
    loggers.silly_logger(get_adjudicator_allocation_from_matching, arguments, 'allocations', __filename)
    var new_allocation = sys.allocation_deepcopy(allocation)
    for (var i in matching) {
        var target_allocation = new_allocation.filter(g => g.id  === parseInt(i))[0]

        target_allocation[role] = matching[i]
    }

    return new_allocation
}

function get_matching(allocation, available_adjudicators, g_ranks, a_ranks, compiled_team_results, compiled_adjudicator_results, role, num) {
    loggers.silly_logger(get_matching, arguments, 'allocations', __filename)
    var sorted_adjudicators = sortings.sort_adjudicators(available_adjudicators, compiled_adjudicator_results)
    var sorted_allocation = sortings.sort_allocation(allocation, compiled_team_results)

    var chair_matching = matchings.gale_shapley(sorted_allocation.map(a => a.id), available_adjudicators.map(a => a.id), g_ranks, a_ranks, num)

    var new_allocation = get_adjudicator_allocation_from_matching(allocation, chair_matching, role)
    return new_allocation
}

function get_adjudicator_allocation (r, allocation, adjudicators, teams, compiled_team_results, compiled_adjudicator_results, {chairs: chairs, panels: panels, trainees: trainees}, config, {filters: filters=['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past', 'by_random']}) {//GS ALGORITHM BASED//
    loggers.silly_logger(get_adjudicator_allocation, arguments, 'allocations', __filename)
    var available_teams = tools.filter_available(teams, r)
    var available_adjudicators = tools.filter_available(adjudicators, r)

    var filter_functions_adj = filters.filter(f => adjfilter_methods1.hasOwnProperty(f)).map(f => adjfilter_methods1[f])
    var filter_functions_adj2 = filters.filter(f => adjfilter_methods2.hasOwnProperty(f)).map(f => adjfilter_methods2[f])

    const [g_ranks, a_ranks] = get_adjudicator_ranks(r, allocation, available_teams, available_adjudicators, compiled_adjudicator_results, filter_functions_adj, filter_functions_adj2, config)
    var new_allocation = get_matching(allocation, available_adjudicators, g_ranks, a_ranks, compiled_team_results, compiled_adjudicator_results, "chairs", chairs)

    var active_adjudicators = Array.prototype.concat.apply([], new_allocation.map(s => s.chairs))
    var remaining_adjudicator_ids = math.set_minus(available_adjudicators.map(a => a.id), active_adjudicators)
    var remaining_adjudicators = remaining_adjudicator_ids.map(id => sys.find_one(adjudicators, id))
    new_allocation = get_matching(new_allocation, remaining_adjudicators, g_ranks, a_ranks, compiled_team_results, compiled_adjudicator_results, "panels", panels)
    active_adjudicators = Array.prototype.concat.apply([], new_allocation.map(s => s.chairs)).concat(Array.prototype.concat.apply([], new_allocation.map(s => s.panels)))
    remaining_adjudicator_ids = math.set_minus(available_adjudicators.map(a => a.id), active_adjudicators)
    remaining_adjudicators = remaining_adjudicator_ids.map(id => sys.find_one(adjudicators, id))
    new_allocation = get_matching(new_allocation, remaining_adjudicators, g_ranks, a_ranks, compiled_team_results, compiled_adjudicator_results, "trainees", trainees)

    return new_allocation
}

function get_adjudicator_allocation_traditional(r, allocation, adjudicators, teams, compiled_team_results, compiled_adjudicator_results, numbers_of_adjudicators, config, {assign: assign='high_to_high', scatter: scatter=false}) {
    loggers.silly_logger(get_adjudicator_allocation_traditional, arguments, 'allocations', __filename)

    var available_adjudicators = tools.filter_available(adjudicators, r)
    var sorted_adjudicators = sortings.sort_adjudicators_with_preev(available_adjudicators, compiled_adjudicator_results, config.preev_weights)
    var sorted_allocation = sortings.sort_allocation(allocation, compiled_team_results)


    if (assign === 'high_to_high') {
        var f = traditional_matchings.allocate_high_to_high
    } else if (assign === 'high_to_slight') {
        var f = traditional_matchings.allocate_high_to_slight
    } else if (assign === 'middle_to_high') {
        var f = traditional_matchings.allocate_middle_to_high
    } else if (assign === 'middle_to_slight') {
        var f = traditional_matchings.allocate_middle_to_slight
    }
    var new_allocation = f(r, allocation, adjudicators, teams, compiled_adjudicator_results, compiled_team_results, numbers_of_adjudicators, {scatter: scatter})
    return new_allocation
}

var adjfilter_methods1 = {
    by_bubble: adjfilters.filter_by_bubble,
    by_strength: adjfilters.filter_by_strength,
    by_attendance: adjfilters.filter_by_attendance,
    by_random: adjfilters.filter_by_random
}
var adjfilter_methods2 = {
    by_past: adjfilters.filter_by_past,
    by_institution: adjfilters.filter_by_institution,
    by_conflict: adjfilters.filter_by_conflict
}

var standard = {
    get: get_adjudicator_allocation
}

var traditional = {
    get: get_adjudicator_allocation_traditional
}

var precheck = checks.adjudicator_allocation_precheck

exports.standard = standard
exports.traditional = traditional
exports.precheck = precheck
