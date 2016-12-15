"use strict";
var loggers = require('../../general/loggers.js')
var sortings = require('../../general/sortings.js')
var tools = require('../../general/tools.js')
var sys = require('../sys.js')
var math = require('../../general/math.js')

function measure_slightness(teams, compiled_team_results) {//FOR BP
	var wins = teams.map(id => sys.find_one(compiled_team_results, id).win)
	var sums = teams.map(id => sys.find_one(compiled_team_results, id).sum)
	return [math.sd(wins), math.sd(sums)]
}

function isconflict (r, square, adjudicator, teams) {//TESTED//
	var adj_insti = tools.access_detail(adjudicator, r).institutions
	var adj_confl = tools.access_detail(adjudicator, r).conflicts
	var team_insti = Array.prototype.concat.apply([], square.teams.map(id => sys.find_one(teams, id).institutions))
	if (math.count_common(adj_insti, team_insti) > 0) {
		return true
	}
	if (math.count_common(adj_confl, square.teams) > 0) {
		return true
	}
	return false
}
/*
console.log(isconflict(
	{teams: [1, 2]},
	{id: 1},
	[{id: 1, institutions: [1, 2]}, {id: 2, institutions: [2]}],
	[{id: 1, institutions: [3]}],
	[{id: 1, conflicts: [1]}]
))*/
/*
function select_middle(remaining, sorted_adjudicators, {chairs: chairs, panels: panels, trainees: trainees}) {//TESTED//
	var c_num = Math.floor(sorted_adjudicators.length*chairs/(chairs+panels+trainees))
	var p_num = Math.floor(sorted_adjudicators.length*panels/(chairs+panels+trainees))

	for (var adjudicator of remaining) {
		var i = sorted_adjudicators.map(adj => adj.id).indexOf(adjudicator.id)
		if (p_num <= i && i < p_num+c_num) {
			return adjudicator
		}
	}
	return remaining[0]
}
*/
//console.log(select_middle([{id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}], [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}], {chairs: 1, panels: 2, trainees: 1}))

function distribute_adjudicators(r, sorted_allocation, sorted_adjudicators, teams, {chairs: chairs, panels: panels, trainees: trainees}, middle, options) {//TESTED//
    loggers.silly_logger(distribute_adjudicators, arguments, 'allocations', __filename)
	var new_allocation = sys.allocation_deepcopy(sorted_allocation)
	var remaining = [].concat(sorted_adjudicators)
	var allocate_panel_first = panels > 0 && middle
	for (var j = 0; j < new_allocation.length; j++) {//square to adj
		var square = new_allocation[j]
		var exit_condition = !options.scatter ? (i, remaining) => false : (i, remaining) => (new_allocation.length+1) * (i - 1) + (j + 1) >= sorted_adjudicators.length

		for (var i = 0; i < remaining.length; i++) {
			if (allocate_panel_first) {
				var adjudicator = remaining[i]
				if (!isconflict (r, square, adjudicator, teams)) {
					square.panels.push(adjudicator.id)
					remaining = remaining.filter(adj => adj.id !== adjudicator.id)
					break
				}
			} else {
				var adjudicator = remaining[i]
				if (!isconflict (r, square, adjudicator, teams)) {
					if (square.chairs.length < chairs) {
						square.chairs.push(adjudicator.id)
					} else if (square.panels.length < panels) {
						square.panels.push(adjudicator.id)
					} else if (square.trainees.length < trainees) {
						square.trainees.push(adjudicator.id)
					} else {
						break
					}
					remaining = remaining.filter(adj => adj.id !== adjudicator.id)
				}
			}
			if (exit_condition(i, remaining)) {
				break
			}
		}
	}
	return allocate_panel_first ? distribute_adjudicators(r, new_allocation, remaining, teams, {chairs: chairs, panels: panels-1, trainees: trainees}, false, options.scatter) : new_allocation
}
/*
var sorted_allocation = [
	{chairs: [], panels: [], trainees: [], teams: [3, 4]},
	{chairs: [], panels: [], trainees: [], teams: [1, 2]}
]
console.log(distribute_adjudicators(
	sorted_allocation,
	[
		{id: 1, institutions: [], conflicts: []},
		{id: 2, institutions: [], conflicts: []},
		{id: 3, institutions: [], conflicts: []},
		{id: 4, institutions: [], conflicts: []},
		{id: 69, institutions: [], conflicts: []}
	],
	[
		{id: 1, institutions: []},
		{id: 2, institutions: []},
		{id: 3, institutions: []},
		{id: 4, institutions: []}
	],
	{
		chairs: 1,
		panels: 1,
		trainees: 0,
		scatter: false,
		middle: false
	}
))*/

//allocate adjudicators based on specified sort algorithm
function allocate_adjudicators(r, allocation, adjudicators, teams, compiled_adjudicator_results, compiled_team_results, allocation_sort_algorithm, adjudicators_sort_algorithm, numbers_of_adjudicators, middle, options) {
    loggers.silly_logger(allocate_adjudicators, arguments, 'allocations', __filename)
	var sorted_allocation = allocation_sort_algorithm(allocation, compiled_team_results)
	var sorted_adjudicators = adjudicators_sort_algorithm(adjudicators, compiled_adjudicator_results)

	let new_allocation = distribute_adjudicators(r, sorted_allocation, sorted_adjudicators, teams, numbers_of_adjudicators, middle, options)
	return new_allocation
}

function allocate_high_to_high(r, allocation, adjudicators, teams, compiled_adjudicator_results, compiled_team_results, numbers_of_adjudicators, options) {
    loggers.silly_logger(allocate_high_to_high, arguments, 'allocations', __filename)
	return allocate_adjudicators(
		r,
		allocation,
		adjudicators,
		teams,
		compiled_adjudicator_results,
		compiled_team_results,
		sortings.sort_allocation,
		sortings.sort_adjudicators,
		numbers_of_adjudicators,
		false,
		options
	)
}

function allocate_high_to_slight(r, allocation, adjudicators, teams, compiled_adjudicator_results, compiled_team_results, numbers_of_adjudicators, options) {
    loggers.silly_logger(allocate_high_to_slight, arguments, 'allocations', __filename)
	let f = (a, c) => sortings.sort_allocation(a, c, sortings.allocation_slightness_comparer)
	return allocate_adjudicators(
		r,
		allocation,
		adjudicators,
		teams,
		compiled_adjudicator_results,
		compiled_team_results,
		f,
		sortings.sort_adjudicators,
		numbers_of_adjudicators,
		false,
		options
	)
}

//console.log(sortings.sort_allocation([{teams: [1, 2]}], [{id: 1, win: 1}, {id: 2, win: 3}], sortings.allocation_slightness_comparer))
/*
function sort_by_middle_prioritization(sorted_list, {chairs: chairs=1, panels: panels=2, trainees: trainees=1} = {}) {//TESTED//
	var c_num = Math.floor(sorted_list.length*chairs/(chairs+panels+trainees))
	var p_num = Math.floor(sorted_list.length*panels/(chairs+panels+trainees))
	var div_chairs = []
	var div_panels = []
	var div_trainees = []
	for (var i = 0; i < sorted_list.length; i++) {
		var target = sorted_list[i]
		if (i < p_num) {
			div_panels.push(target)
		} else if (i < p_num+c_num) {
			div_chairs.push(target)
		} else {
			div_trainees.push(target)
		}
	}
	return div_chairs.concat(div_panels).concat(div_trainees)
}

console.log(sort_by_middle_prioritization([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}]))
*/

function allocate_middle_to_high(r, allocation, adjudicators, teams, compiled_adjudicator_results, compiled_team_results, numbers_of_adjudicators, options) {
    loggers.silly_logger(allocate_middle_to_high, arguments, 'allocations', __filename)
	return allocate_adjudicators(
		r,
		allocation,
		adjudicators,
		teams,
		compiled_adjudicator_results,
		compiled_team_results,
		sortings.sort_allocation,
		sortings.sort_adjudicators,
		numbers_of_adjudicators,
		true,
		options
	)
}

function allocate_middle_to_slight(r, allocation, adjudicators, teams, compiled_adjudicator_results, compiled_team_results, numbers_of_adjudicators, options) {
    loggers.silly_logger(allocate_middle_to_slight, arguments, 'allocations', __filename)
	let f = (a, c) => sortings.sort_allocation(a, c, sortings.allocation_slightness_comparer)
	return allocate_adjudicators(
		r,
		allocation,
		adjudicators,
		teams,
		compiled_adjudicator_results,
		compiled_team_results,
		f,
		sortings.sort_adjudicators,
		numbers_of_adjudicators,
		true,
		options
	)
}

exports.allocate_high_to_high = allocate_high_to_high
exports.allocate_middle_to_high = allocate_middle_to_high
exports.allocate_middle_to_slight = allocate_middle_to_slight
exports.allocate_high_to_slight = allocate_high_to_slight
//console.log(measure_slightness([1, 2], [{id: 1, win: 2, sum: 100}, {id: 2, win: 1, sum: 100}]))
