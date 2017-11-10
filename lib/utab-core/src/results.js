"use strict";
var math = require('./general/math.js')
var sys = require('./allocations/sys.js')
var sortings = require('./general/sortings.js')
var loggers = require('./general/loggers.js')
var tools = require('./general/tools.js')
var checks = require('./results/checks.js')

function insert_ranking(list, f) {//TESTED// // f is a function that returns 1 if args[1] >~ args[2]
    loggers.silly_logger(insert_ranking, arguments, 'results', __filename)
    var ids = list.map(e => e.id)
    if (ids.length === 0) {
        return list
    }
    ids.sort((a, b) => f(list, a, b))

	sys.find_one(list, ids[0]).ranking = 1
	var ranking = 1
	var stay = 0

    for (var i = 1; i < ids.length; i++) {
		if (f(list, ids[i], ids[i-1]) === 1) {
			ranking += 1 + stay
			stay = 0
        } else {
			stay += 1
        }

    	sys.find_one(list, ids[i]).ranking = ranking
    }

	return list
}

function sumbyeach (a, b) {//TESTED//
    var new_list = []
    for (var i = 0, M = Math.min(a.length, b.length); i < M; i++) {
        new_list.push(a[i] + b[i])
    }
    return new_list
}

function get_weighted_score(scores, style) {
    var score_weights = style.score_weights
    var score = 0
    var sum_weight = 0
    for (var i = 0; i < scores.length; i++) {
        if (scores[i] !== 0) {
            score += scores[i]
            sum_weight += score_weights.find(w => w.order === i+1).value
        }
    }
    return sum_weight === 0 ? 0 : score/sum_weight
}

function summarize_speaker_results(speaker_instances, raw_speaker_results, style, r) {
    loggers.silly_logger(summarize_speaker_results, arguments, 'results', __filename)
    var speakers = speaker_instances.map(d => d.id)
    var results = []
    for (var id of speakers) {
        var filtered_speaker_results = raw_speaker_results.filter(dr => dr.r === r && dr.id === id)
        if (filtered_speaker_results.length === 0) {
            continue
        }
        var result = {r: r, id: id, scores: [], sum: 0}
        var scores_list = filtered_speaker_results.map(dr => dr.scores.slice().sort((s1, s2) => s1.order > s2.order ? 1 : -1).map(r => r.value))
        let scores = scores_list.reduce((a, b) => sumbyeach(a, b)).map(sc => sc/scores_list.length)
        result.scores = []
        for (let index of math.range(scores.length)) {
            result.scores.push({
                order: index + 1,
                value: scores[index]
            })
        }
        result.average = get_weighted_score(scores, style)
        result.sum = math.sum(scores)
        result.user_defined_data_collection = filtered_speaker_results.map(dr => dr.user_defined_data).filter(d => d !== null && d !== undefined)
        results.push(result)
    }
    insert_ranking(results, sortings.speaker_simple_comparer)
    return results
}

function summarize_team_draws(team_instances, all_draws, rs) {
    let draws = all_draws.filter(d => rs.includes(d.r))
    let watched = []
    let summarized = {}
    for (let team of team_instances) {
        summarized[team.id] = []
    }
    for (let draw of draws) {
        for (let square of draw.allocation) {
            let teams = [square.teams.gov, square.teams.opp]
            for (let id of teams) {
                if (!summarized.hasOwnProperty(id)) { continue }
                summarized[id].push({
                  r: draw.r,
                  side: square.teams.gov === id ? 'gov' : 'opp',
                  opponents: teams.filter(id2 => id2 !== id)
                })
            }
        }
    }
    return summarized
}

function summarize_adjudicator_draws(adjudicator_instances, all_draws, rs) {
    let draws = all_draws.filter(d => rs.includes(d.r))
    let watched = []
    let summarized = {}
    for (let adjudicator of adjudicator_instances) {
        summarized[adjudicator.id] = []
    }
    for (let draw of draws) {
        for (let square of draw.allocation) {
            let adjudicators = square.chairs.concat(square.panels).concat(square.trainees)
            for (let id of adjudicators) {
                if (!summarized.hasOwnProperty(id)) { continue }
                summarized[id].push({
                  judged_teams: [square.teams.gov, square.teams.opp],
                  is_chair: square.chairs.includes(id)
                })
            }
        }
    }
    return summarized
}

function summarize_adjudicator_results(adjudicator_instances, raw_adjudicator_results, r) {//TESTED//
    loggers.silly_logger(summarize_adjudicator_results, arguments, 'results', __filename)
    var adjudicators = adjudicator_instances.map(a => a.id)
    var results = []
    for (var id of adjudicators) {
        var filtered_adjudicator_results = raw_adjudicator_results.filter(ar => ar.r === r && ar.id === id)
        if (filtered_adjudicator_results.length === 0) {
            continue
        }
        var score_list = filtered_adjudicator_results.map(ar => ar.score)

        var score = math.average(score_list)
        var comments = filtered_adjudicator_results.map(ar => ar.comment).filter(c => c !== '')
        var result = {r, id, score, comments}
        result.user_defined_data_collection = filtered_adjudicator_results.map(ar => ar.user_defined_data).filter(d => d !== null && d !== undefined)
        results.push(result)
    }

    insert_ranking(results, sortings.adjudicator_simple_comparer)
    return results
}

function summarize_team_results (team_instances, raw_team_results, r, style) {//TESTED// FOR NA
    loggers.silly_logger(summarize_team_results, arguments, 'results', __filename)
    var results = []
    var teams = team_instances.map(t => t.id)
    for (var id of teams) {
        var filtered_team_results = raw_team_results.filter(tr => tr.id === id && tr.r === r)
        if (filtered_team_results.length === 0) {
            continue
        }
        var vote = math.count(filtered_team_results.map(tr => tr.win), 1) - math.count(filtered_team_results.map(tr => tr.win), 0)////////for NA
        var vote_rate = math.count(filtered_team_results.map(tr => tr.win), 1)/filtered_team_results.length
        var win = vote > 0 ? 1 : 0
        var opponents = filtered_team_results[0].opponents

        var result = {r, id, win, opponents, sum: null, vote, vote_rate, acc: filtered_team_results.length, margin: null}
        result.user_defined_data_collection = filtered_team_results.map(tr => tr.user_defined_data).filter(d => d !== null && d != undefined)
        results.push(result)
    }
    insert_ranking(results, sortings.team_simple_comparer)
    return results
}

function integrate_team_and_speaker_results (teams, team_results, speaker_results, r) {//TESTED//
    loggers.silly_logger(integrate_team_and_speaker_results, arguments, 'results', __filename)
    var results = []

    for (let team_result of team_results) { // Add sum score
        let team = teams.filter(t => t.id === team_result.id)[0]
        let speakers = Array.from(new Set(tools.access_detail(team, r).speakers))

        var filtered_speaker_results = Array.prototype.concat.apply([], speakers.map(id => speaker_results.filter(dr => dr.r === r && dr.id === id)))
        if (filtered_speaker_results.length !== 0) {
            var sum = math.sum(filtered_speaker_results.map(dr => dr.sum))
        } else {
            var sum = null
        }

        var result = {r: team_result.r, id: team_result.id, win: team_result.win, opponents: team_result.opponents, sum: sum, vote: team_result.vote, vote_rate: team_result.vote_rate, acc: team_result.acc}
        result.user_defined_data_collection = team_result.user_defined_data_collection
        results.push(result)
    }
    for (let result of results) {// Add Margin
        if (result.sum === null) {
            result.margin = null
        } else {
            result.margin = result.sum - math.sum(result.opponents.map(op_id => sys.find_one(results, op_id).sum))/result.opponents.length
        }
    }

    insert_ranking(results, sortings.team_comparer)
    return results
}

function compile_speaker_results (speaker_instances, raw_speaker_results, style, rs) {//TESTED//
    loggers.results('compile_speaker_results is called')
    loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))
    var results = []
    var speakers = speaker_instances.map(d => d.id)
    var _averages = {}
    var _details = {}

    for (let id of speakers) {
        _averages[id] = []
        _details[id] = []
    }

    for (let r of rs) {
        var summarized_speaker_results = summarize_speaker_results(speaker_instances, raw_speaker_results, style, r)
        for (let summarized_speaker_result of summarized_speaker_results) {
            let id = summarized_speaker_result.id
            _averages[id].push(summarized_speaker_result.average)
            _details[id].push(summarized_speaker_result)
        }
    }

    for (let id of speakers) {
        let result = {
            id: id,
            average: math.average(_averages[id]),
            sum: math.sum(_averages[id]),
            sd: math.sd(_averages[id]),
            details: _details[id]
        }
        results.push(result)
    }

    insert_ranking(results, sortings.speaker_comparer)
    return results
}

function compile_adjudicator_results (adjudicator_instances, raw_adjudicator_results, draws, rs) {//TESTED//
    loggers.results('compile_adjudicator_results is called')
    loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))
    var results = []
    var adjudicators = adjudicator_instances.map(a => a.id)
    var _averages = {}
    var _details = {}
    var _judged_teams = {}
    var _num_experienced = {}
    var _num_experienced_chair = {}
    var _comments = {}
    let summarized_draws = summarize_adjudicator_draws(adjudicator_instances, draws, rs)

    for (let id of adjudicators) {
        _averages[id] = []
        _details[id] = []
        _comments[id] = []
    }

    for (let r of rs) {
        let summarized_adjudicator_results = summarize_adjudicator_results(adjudicator_instances, raw_adjudicator_results, r)
        for (let summarized_adjudicator_result of summarized_adjudicator_results) {
            let id = summarized_adjudicator_result.id
            let summarized_draw = summarized_draws[id].find(s => s.r === r)
            _averages[id].push(summarized_adjudicator_result.score)
            _details[id].push(Object.assign(summarized_adjudicator_result, summarized_draw))
            _comments[id] = _comments[id].concat(summarized_adjudicator_result.comments)
        }
    }

    for (var id of adjudicators) {
        let result = {
            id: id,
            average: math.average(_averages[id]),
            sd: math.sd(_averages[id]),
            judged_teams: [].concat(...summarized_draws[id].map(s => s.judged_teams)),
            num_experienced: summarized_draws[id].length,
            num_experienced_chair: summarized_draws[id].filter(s => s.is_chair).length,
            comments: _comments[id],
            details: _details[id]
        }
        results.push(result)
    }

    insert_ranking(results, sortings.adjudicator_comparer)
    return results
}

/*
{
    Number: {
        ranking: Number,
        win: Number,
        past_opponents: [Number],
        past_sides: [Number],
        details: {
            Number: {
                win: Number
            }
        }
    }
}
*/


function compile_team_results () {//TESTED//
    if (arguments.length === 7) {
        var [team_instances, speaker_instances, raw_team_results, raw_speaker_results, draws, rs, style] = arguments
        var simple = false
    } else {
        var [team_instances, raw_team_results, draws, rs, style] = arguments
        var simple = true
    }
    loggers.results('compile_team_results is called')
    loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))
    var results = []
    var teams = team_instances.map(t => t.id)

    var _sums = {}
    var _details = {}
    var _margins = {}

    var _wins = {}
    var _votes = {}
    var _accs = {}
    let summarized_draws = summarize_team_draws(team_instances, draws, rs)

    for (id of teams) {
        _details[id] = []
        _sums[id] = []
        _margins[id] = []

        _wins[id] = []
        _votes[id] = 0
        _accs[id] = 0
    }

    for (var r of rs) {
        if (!simple) {
            var summarized_team_results_before_integration = summarize_team_results(team_instances, raw_team_results, r, style)
            var summarized_speaker_results = summarize_speaker_results(speaker_instances, raw_speaker_results, style, r)
            var summarized_team_results = integrate_team_and_speaker_results (team_instances, summarized_team_results_before_integration, summarized_speaker_results, r)
        } else {
            var summarized_team_results = summarize_team_results(team_instances, raw_team_results, r, style)
        }

        for (let summarized_team_result of summarized_team_results) {
            let id = summarized_team_result.id
            let summarized_draw = summarized_draws[id].find(s => s.r === r)
            _votes[id] += summarized_team_result.vote
            _accs[id] += summarized_team_result.acc
            _wins[id].push(summarized_team_result.win)
            if (!simple) {
                _sums[id].push(summarized_team_result.sum)
                _margins[id].push(summarized_team_result.margin)
            }
            _details[id].push(Object.assign(summarized_team_result, summarized_draw))
        }
    }

    for (var id of teams) {
        var result = {
            id: id,
            win: math.sum(_wins[id]),
            vote: _votes[id],
            vote_rate: _accs[id] === 0 ? 0 : _votes[id]/_accs[id],
            details: _details[id],
            past_opponents: [].concat(...summarized_draws[id].map(s => s.opponents)),
            past_sides: summarized_draws[id].map(s => s.side),
            sum: simple ? null : math.sum(_sums[id]),
            margin: simple ? null : math.sum(_margins[id]),
            average_margin: simple ? null : math.average(_margins[id]),
            average: simple ? null : math.average(_sums[id]),
            sd: simple ? null : math.sd(_sums[id])
        }
        results.push(result)
    }

    insert_ranking(results, sortings.team_comparer)
    return results
}

var teams = {
    compile: compile_team_results,
    simple_compile: compile_team_results,
    precheck: checks.team_results_precheck
}
var speakers = {
    compile: compile_speaker_results,
}
var adjudicators = {
    compile: compile_adjudicator_results,
}

exports.teams = teams
exports.adjudicators = adjudicators
exports.speakers = speakers
