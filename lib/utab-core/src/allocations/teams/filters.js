"use strict";
var loggers = require('../../general/loggers.js')
var math = require('../../general/math.js');
var sys = require('../sys.js')
var tools = require('../../general/tools.js')

function filter_by_side (team, a, b, {results, r: r}) {
    var team_a_past_sides = results[a.id].past_sides
    var team_b_past_sides = results[b.id].past_sides
    var team_past_sides = results[team.id].past_sides
    var a_fit = sys.one_sided(team_a_past_sides) * sys.one_sided(team_past_sides) < 0
    var b_fit = sys.one_sided(team_b_past_sides) * sys.one_sided(team_past_sides) < 0

    if (a_fit && !b_fit) {
        return -1
    } else if (b_fit && !a_fit) {
        return 1
    } else {
        return 0
    }
}

function filter_by_strength (team, a, b, {results, r: r}) {
    var a_win = results[a.id].win
    var b_win = results[b.id].win
    var team_win = results[team.id].win
    var a_win_diff = Math.abs(team_win - a_win)
    var b_win_diff = Math.abs(team_win - b_win)
    return Math.sign(a_win_diff - b_win_diff)
}

function filter_by_institution (team, a, b, {results, r: r}) {
    var a_institutions = tools.access_detail(a, r).institutions
    var b_institutions = tools.access_detail(b, r).institutions
    var team_institutions = tools.access_detail(team, r).institutions

    var a_insti = math.count_common(a_institutions, team_institutions)
    var b_insti = math.count_common(b_institutions, team_institutions)
    return Math.sign(a_insti - b_insti)
}

function filter_by_past_opponent (team, a, b, {results, r: r}) {
    var a_past = math.count(results[a.id].past_opponents, team.id)
    var b_past = math.count(results[b.id].past_opponents, team.id)
    return Math.sign(a_past - b_past)
}

exports.filter_by_side = filter_by_side
exports.filter_by_institution = filter_by_institution
exports.filter_by_past_opponent = filter_by_past_opponent
exports.filter_by_strength = filter_by_strength
