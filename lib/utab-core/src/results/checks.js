"use strict"
var math = require('../general/math')
var tools = require('../general/tools.js')
var loggers = require('../general/loggers.js')
var errors = require('../general/errors.js')

function speaker_results_precheck(raw_speaker_results, speakers, r, team_num) {
    loggers.silly_logger(speaker_results_precheck, arguments, 'checks', __filename)
    for (var speaker of speakers) {
        var results = raw_speaker_results.filter(rdr => rdr.id === speaker.id && rdr.r === r)
        if (results.length === 0) {
            loggers.results('warn', 'results of ' + 'speaker' + ': '+speaker.id + ' is not sent')
            throw new errors.ResultNotSent(speaker.name, 'speaker', r)
        }
    }
}

function adjudicator_results_precheck(raw_adjudicator_results, adjudicators, r, team_num) {
    loggers.silly_logger(adjudicator_results_precheck, arguments, 'checks', __filename)
    let available_adjudicators = adjudicators.filter(a => tools.access_detail(a, r).available)
    for (var adjudicator of available_adjudicators) {
        var results = raw_adjudicator_results.filter(rar => rar.id === adjudicator.id && rar.r === r)
        if (results.length === 0) {
            loggers.results('warn', 'results of ' + 'adjudicator' + ': '+adjudicator.id + ' is not sent')
            throw new errors.ResultNotSent(adjudicator.name, 'adjudicator', r)
        }
    }
}

function team_results_precheck(raw_team_results, teams, r, team_num) {//TESTED
    loggers.silly_logger(team_results_precheck, arguments, 'checks', __filename)
    let available_teams = teams.filter(t => tools.access_detail(t, r).available)
    for (var team of available_teams) {
        var results = raw_team_results.filter(rdr => rdr.id === team.id && rdr.r === r)
        if (results.length === 0) {
            loggers.results('warn', 'results of ' + 'team' + ': '+team.id + ' is not sent')
            throw new errors.ResultNotSent(team.name, 'team', r)
        }
        if (team_num === 2) {
            if (results.length % 2 === 0) {
                if (results.filter(r => r.win === 1).length === results.filter(r => r.win === 0).length) {
                    loggers.results('warn', 'cannot decide win of team '+team.id)
                    throw new errors.WinPointsDifferent(team.name, results.map(r => r.win))
                }
            }
        } else if (team_num === 4) {
            if (results.filter(r => r.win != results[0].win).length > 0) {
                loggers.results('warn', 'the win point is not unified : '+team.id)
                throw new errors.WinPointsDifferent(team.name, results.map(r => r.win))
            }
        }
    }
}
//check_raw_speaker_results([{id: 1, r: 1}, {id: 2, r: 1}], [{id: 1}, {id: 2}], 1)

//check_raw_team_results([{id: 1, r: 1, win: 1}, {id: 1, r: 1, win: 0}, {id: 2, r: 1, win: 1}], [{id: 1}, {id: 2}], 1, 2)


function results_precheck(teams, speakers, r) {
    loggers.silly_logger(results_precheck, arguments, 'checks', __filename)
    //check_sublist(teams, speakers, 'team', 'speakers', r)
    tools.check_detail(teams, r)
    let speaker_ids = speakers.map(s => s.id)
    for (let team of teams) {
        for (let detail of team.details) {
            for (let id of detail.speakers) {
                if (!speaker_ids.includes(id)) {
                    throw new errors.EntityNotRegistered(id, 'speaker')
                }
            }
        }
    }
}

exports.speaker_results_precheck = speaker_results_precheck
exports.team_results_precheck = team_results_precheck
exports.adjudicator_results_precheck = adjudicator_results_precheck
exports.results_precheck = results_precheck
