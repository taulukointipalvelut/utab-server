"use strict";
var loggers = require('../../general/loggers.js')
var math = require('../../general/math.js');
var sys = require('../sys.js')
var tools = require('../../general/tools.js')

// if b is more desirable, return 1
function filter_by_random(team, a, b, {compiled_team_results: compiled_team_results, r: r}) {
    let f = team => team.id % (r + 2760)
    return f(a) > f(b) ? 1 : -1
}

function filter_by_side (team, a, b, {compiled_team_results: compiled_team_results, r: r}) {
    var team_a_past_sides = sys.find_one(compiled_team_results, a.id).past_sides
    var team_b_past_sides = sys.find_one(compiled_team_results, b.id).past_sides
    var team_past_sides = sys.find_one(compiled_team_results, team.id).past_sides
    var a_fit = sys.one_sided(team_a_past_sides) * sys.one_sided(team_past_sides) < 0
    var b_fit = sys.one_sided(team_b_past_sides) * sys.one_sided(team_past_sides) < 0

    if (a_fit & !b_fit) {
        return -1
    } else if (b_fit & !a_fit) {
        return 1
    } else {
        return 0
    }
}

function filter_by_strength (team, a, b, {compiled_team_results: compiled_team_results, r: r}) {
    var a_win = sys.find_one(compiled_team_results, a.id).win
    var b_win = sys.find_one(compiled_team_results, b.id).win
    var team_win = sys.find_one(compiled_team_results, team.id).win
    var a_win_diff = Math.abs(team_win - a_win)
    var b_win_diff = Math.abs(team_win - b_win)
    if (a_win_diff > b_win_diff) {
        return 1
    } else if (a_win_diff < b_win_diff) {
        return -1
    } else {
        var a_sum = sys.find_one(compiled_team_results, a.id).sum
        var b_sum = sys.find_one(compiled_team_results, b.id).sum
        var team_sum = sys.find_one(compiled_team_results, team.id).sum
        var a_sum_diff = Math.abs(team_sum - a_sum)
        var b_sum_diff = Math.abs(team_sum - b_sum)
        if (a_sum_diff > b_sum_diff) {
            return 1
        } else if (a_sum_diff < b_sum_diff) {
            return -1
        } else {
            return 0
        }
    }
}

function filter_by_institution (team, a, b, {compiled_team_results: compiled_team_results, r: r}) {
    var a_institutions = tools.access_detail(a, r).institutions
    var b_institutions = tools.access_detail(b, r).institutions
    var team_institutions = tools.access_detail(team, r).institutions

    var a_insti = math.count_common(a_institutions, team_institutions)
    var b_insti = math.count_common(b_institutions, team_institutions)
    if (a_insti < b_insti) {
        return -1
    } else if (a_insti > b_insti) {
        return 1
    } else {
        return 0
    }
}

function filter_by_past_opponent (team, a, b, {compiled_team_results: compiled_team_results, r: r}) {
    var a_past = math.count(sys.find_one(compiled_team_results, a.id).past_opponents, team.id)
    var b_past = math.count(sys.find_one(compiled_team_results, a.id).past_opponents, team.id)
    if (a_past > b_past) {
        return 1
    } else if (a_past < b_past) {
        return -1
    } else {
        return 0
    }
}

exports.filter_by_random = filter_by_random
exports.filter_by_side = filter_by_side
exports.filter_by_institution = filter_by_institution
exports.filter_by_past_opponent = filter_by_past_opponent
exports.filter_by_strength = filter_by_strength
