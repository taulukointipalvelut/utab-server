"use strict";
var sys = require('./sys.js')
var tools = require('../general/tools.js')
var sortings = require('../general/sortings.js')
var math = require('../general/math.js')
var adjfilters = require('./adjudicators/adjfilters.js')
var traditional_matchings = require('./adjudicators/traditional_matchings.js')
var loggers = require('../general/loggers.js')

function get_adjudicator_allocation_from_matching(allocation, matching, role) {
    loggers.silly_logger(get_adjudicator_allocation_from_matching, arguments, 'draws', __filename)
    var new_allocation = sys.allocation_deepcopy(allocation)
    for (var i in matching) {
        var target_allocation = new_allocation.filter(g => g.id  === parseInt(i, 10))[0]

        target_allocation[role] = target_allocation[role].concat(matching[i])
    }

    return new_allocation
}

function get_matching(allocation, adjudicator_ids, ranks, role) {
    loggers.silly_logger(get_matching, arguments, 'draws', __filename)
    let square_ids = allocation.map(square => square.id)

    let matching = sys.matching_different(square_ids, adjudicator_ids, ranks)

    let new_allocation = get_adjudicator_allocation_from_matching(allocation, matching, role)
    return new_allocation
}

function reset_allocation (allocation) {
    let new_allocation = allocation.map(square => Object.assign({}, square))
    for (let square of new_allocation) {
        square.chairs = []
        square.panels = []
        square.trainees = []
    }
    return new_allocation
}

let get_ranks_methods = {
    absolute: sys.get_ranks_absolute,
    original: sys.get_ranks_original,
    straight: sys.get_ranks_straight,
    weighted: sys.get_ranks_weighted,
    weighted_linear: sys.get_ranks_weighted_linear
    //custom: sys.get_ranks_custom
}

function get_adjudicator_draw (round, draw, adjudicators, teams, compiled_team_results, compiled_adjudicator_results, nums, config, {filters: filters=['by_bubble', 'by_strength', 'by_num', 'by_num_chair', 'by_conflict', 'by_institution', 'by_past'], method: method='straight'}) {
    loggers.silly_logger(get_adjudicator_draw, arguments, 'draws', __filename)
    var available_teams = tools.filter_available(teams, round.r)
    var available_adjudicators = tools.filter_available(adjudicators, round.r)
    let allocation = reset_allocation(draw.allocation)

    var filter_functions_adj = filters.map(f => adjfilter_methods[f])
    let results = sys.convert_compiled_results(compiled_adjudicator_results)
    const ranks = get_ranks_methods[method](allocation, available_adjudicators, filter_functions_adj, { teams: available_teams, round, results, config })
    for (let label of ['chairs', 'panels', 'trainees']) {
        for (let i = 0; i < (nums[label] !== undefined ? nums[label] : 0); i++) {
            let active_adjudicator_ids = [].concat(...allocation.map(s => s.chairs.concat(s.panels).concat(s.trainees)))
            let remaining_adjudicator_ids = math.set_minus(available_adjudicators.map(a => a.id), active_adjudicator_ids)
            allocation = get_matching(allocation, remaining_adjudicator_ids, ranks, label)
        }
    }

    let new_draw = { r: draw.r, allocation }
    return new_draw
}

function get_adjudicator_draw_traditional(round, draw, adjudicators, teams, compiled_team_results, compiled_adjudicator_results, numbers_of_adjudicators, config, {assign: assign='high_to_high', scatter: scatter=false}) {
    loggers.silly_logger(get_adjudicator_draw_traditional, arguments, 'draws', __filename)
    let allocation = reset_allocation(draw.allocation)

    var available_adjudicators = tools.filter_available(adjudicators, round.r)
    let adjudicator_results = sys.convert_compiled_results(compiled_adjudicator_results)
    var sorted_adjudicators = sortings.sort_adjudicators_with_preev(available_adjudicators, adjudicator_results, config.preev_weights)
    var sorted_allocation = sortings.sort_allocation(allocation, compiled_team_results)

    let assign_func = assign_funcs[assign]
    var new_allocation = assign_func(round.r, allocation, available_adjudicators, teams, compiled_adjudicator_results, compiled_team_results, numbers_of_adjudicators, {scatter: scatter})
    let new_draw = {
        r: draw.r,
        allocation: new_allocation
    }
    return new_draw
}

let assign_funcs = {
    high_to_high: traditional_matchings.allocate_high_to_high,
    high_to_slight: traditional_matchings.allocate_high_to_slight,
    middle_to_high: traditional_matchings.allocate_middle_to_high,
    middle_to_slight: traditional_matchings.allocate_middle_to_slight
}

var adjfilter_methods = {
    by_bubble: adjfilters.filter_by_bubble,
    by_strength: adjfilters.filter_by_strength,
    by_num: adjfilters.filter_by_num_experienced,
    by_num_chair: adjfilters.filter_by_num_experienced_chair,
    by_past: adjfilters.filter_by_past,
    by_institution: adjfilters.filter_by_institution,
    by_conflict: adjfilters.filter_by_conflict
}

var standard = {
    get: get_adjudicator_draw
}

var traditional = {
    get: get_adjudicator_draw_traditional
}

exports.standard = standard
exports.traditional = traditional
