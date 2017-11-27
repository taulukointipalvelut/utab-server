"use strict"
var math = require('../general/math')
var tools = require('../general/tools.js')
var loggers = require('../general/loggers.js')
var errors = require('../general/errors.js')

function team_results_precheck(raw_team_results, teams, r) {//TESTED
    loggers.silly_logger(team_results_precheck, arguments, 'checks', __filename)
    for (var team of teams) {
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

function speaker_results_precheck(raw_speaker_results, speakers, r) {
    for (let speaker of speakers) {
        var results = raw_speaker_results.filter(rdr => rdr.id === speaker.id && rdr.r === r)
        if (results.length === 0) { continue }
        let unpresent_orders_list = results.map(result => result.scores.filter(score => score.value === 0).map(score => score.order))
        for (let unpresent_orders of unpresent_orders_list) {
            if (math.set_minus(unpresent_orders_list[0], unpresent_orders).length !== 0) {
                loggers.results('warn', 'cannot calculate the speaker score '+speaker.id)
                throw new errors.SpeakersDifferent(speaker.name)
            }
        }
    }
}

exports.team_results_precheck = team_results_precheck
exports.speaker_results_precheck = speaker_results_precheck
