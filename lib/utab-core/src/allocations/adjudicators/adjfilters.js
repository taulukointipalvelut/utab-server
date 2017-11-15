"use strict";
// adj -> square : filter_by_conflict, filter_by_past, filter_by_institution
// square -> adj : filter_by_bubble, filter_by_strength, filter_by_attendance
var math = require('../../general/math.js')
var sys = require('../sys.js')
var loggers = require('../../general/loggers.js')
var tools = require('../../general/tools.js')
var sortings = require('../../general/sortings.js')

function filter_by_strength(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    let preev_weights = config.preev_weights
    var a_ev = sortings.evaluate_adjudicator(a, compiled_adjudicator_results, preev_weights)
    var b_ev = sortings.evaluate_adjudicator(b, compiled_adjudicator_results, preev_weights)
    if (a_ev < b_ev) {
        return 1
    } else if (a_ev > b_ev) {
        return -1
    } else {
        return 0
    }
}

////////////////////////////////////////////////////////////////////////
function filter_by_bubble(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    let preev_weights = config.preev_weights
    var a_ev = sortings.evaluate_adjudicator(a, compiled_adjudicator_results, preev_weights)
    var b_ev = sortings.evaluate_adjudicator(b, compiled_adjudicator_results, preev_weights)

    undefined

    return 0
}

function filter_by_num_experienced(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    var a_num_experienced = sys.find_one(compiled_adjudicator_results, a.id).num_experienced
    var b_num_experienced = sys.find_one(compiled_adjudicator_results, b.id).num_experienced
    if (a_num_experienced > b_num_experienced) {
        return 1
    } else if (a_num_experienced < b_num_experienced) {
        return -1
    } else {
        return 0
    }
}

function filter_by_num_experienced_chair(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    var a_num_experienced_chair = sys.find_one(compiled_adjudicator_results, a.id).num_experienced_chair
    var b_num_experienced_chair = sys.find_one(compiled_adjudicator_results, b.id).num_experienced_chair
    if (a_num_experienced_chair > b_num_experienced_chair) {
        return 1
    } else if (a_num_experienced_chair < b_num_experienced_chair) {
        return -1
    } else {
        return 0
    }
}

function filter_by_past(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    var a_watched = math.count_common([square.teams.gov, square.teams.opp], sys.find_one(compiled_adjudicator_results, a.id).judged_teams)
    var b_watched = math.count_common([square.teams.gov, square.teams.opp], sys.find_one(compiled_adjudicator_results, b.id).judged_teams)
    if (a_watched > b_watched) {
        return 1
    } else if (a_watched < b_watched) {
        return -1
    } else {
        return 0
    }
}

function filter_by_institution(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    var square_institutions = Array.prototype.concat.apply([], [square.teams.gov, square.teams.opp].map(t => tools.find_and_access_detail(teams, t, r).institutions))
    var a_institutions = tools.access_detail(a, r).institutions
    var b_institutions = tools.access_detail(b, r).institutions
    var a_conflict = math.count_common(square_institutions, a_institutions)
    var b_conflict = math.count_common(square_institutions, b_institutions)
    if (a_conflict > b_conflict) {
        return 1
    } else if (a_conflict < b_conflict) {
        return -1
    } else {
        return 0
    }
}

function filter_by_conflict(square, a, b, {teams: teams, compiled_adjudicator_results: compiled_adjudicator_results, config: config, r: r}) {
    var a_conflict = math.count_common([square.teams.gov, square.teams.opp], tools.access_detail(a, r).conflicts)
    var b_conflict = math.count_common([square.teams.gov, square.teams.opp], tools.access_detail(b, r).conflicts)
    if (a_conflict > b_conflict) {
        return 1
    } else if (a_conflict < b_conflict) {
        return -1
    } else {
        return 0
    }
}

exports.filter_by_strength = filter_by_strength
exports.filter_by_past = filter_by_past
exports.filter_by_institution = filter_by_institution
exports.filter_by_bubble = filter_by_bubble
exports.filter_by_num_experienced_chair = filter_by_num_experienced_chair
exports.filter_by_num_experienced = filter_by_num_experienced
exports.filter_by_conflict = filter_by_conflict
