"use strict";
var math = require('../general/math.js')
var loggers = require('../general/loggers.js')
let sortings = require('../general/sortings.js')

function get_ranks_absolute(entities1, entities2, filter_functions, dict) {
    loggers.silly_logger(get_ranks_absolute, arguments, 'draws', __filename)
    var ranks = {}

    for (let entity of entities1) {
        let others = entities2.filter(other => entity.id !== other.id)
        for (let func of filter_functions.slice().reverse()) {
            others.sort((a, b) => func(entity, a, b, dict))
        }

        ranks[entity.id] = others.map(o => o.id)
    }
    return ranks
}

function get_ranks_original(entities1, entities2, filter_functions, dict) {
    loggers.silly_logger(get_ranks_original, arguments, 'draws', __filename)
    var ranks = {}

    for (let entity of entities1) {
        let others = entities2.filter(other => entity.id !== other.id)
        others.sort(sortings.sort_decorator(entity, filter_functions, dict))

        ranks[entity.id] = others.map(o => o.id)
    }
    return ranks
}

function integrate_filter_functions(entity, filter_functions, weights, dict) {
    loggers.silly_logger(integrate_filter_functions, arguments, 'draws', __filename)
    function f(a, b) {
        let a_val = 0
        let c = 0
        for (let func of filter_functions) {
            a_val += weights[c] * func(entity, a, b, dict)
            c += 1
        }
        return Math.sign(a_val)
    }
    return f
}

function get_ranks_by_weights(entities1, entities2, filter_functions, dict, weights) {
    loggers.silly_logger(get_ranks_by_weights, arguments, 'draws', __filename)
    var ranks = {}

    for (let entity of entities1) {
        let others = entities2.filter(other => entity.id !== other.id)
        others.sort(integrate_filter_functions(entity, filter_functions, weights, dict))

        ranks[entity.id] = others.map(o => o.id)
    }
    return ranks
}

function get_ranks_straight(entities1, entities2, filter_functions, dict) {
    loggers.silly_logger(get_ranks_straight, arguments, 'draws', __filename)
    let weights = Array(filter_functions.length).fill(1)
    return get_ranks_by_weights(entities1, entities2, filter_functions, dict, weights)
}

function get_ranks_weighted(entities1, entities2, filter_functions, dict) {
    loggers.silly_logger(get_ranks_weighted, arguments, 'draws', __filename)
    let weights = Array(filter_functions.length).fill(0).map((_, i) => 1/(i+1))
    return get_ranks_by_weights(entities1, entities2, filter_functions, dict, weights)
}

function get_ranks_weighted_linear(entities1, entities2, filter_functions, dict) {
    loggers.silly_logger(get_ranks_weighted, arguments, 'draws', __filename)
    let weights = Array(filter_functions.length).fill(0).map((_, i) => (filter_functions.length-i)/filter_functions.length)
    return get_ranks_by_weights(entities1, entities2, filter_functions, dict, weights)
}

/*
function get_team_ranks_custom(r, entities, compiled_team_results, filter_functions, weights) {
    loggers.silly_logger(get_team_ranks_custom, arguments, 'draws', __filename)
    var ranks = {}

    for (let entity of entities) {
        let others = entities.filter(other => team.id !== other.id)
        others.sort(integrate_filter_functions(team, filter_functions, weights, {r: r, compiled_team_results: compiled_team_results}))

        ranks[team.id] = others.map(o => o.id)
    }
    return ranks
}*/

function matching_same (prop_ids, ranks) {
    let matching = {}
    let matched = []
    for (let prop_id of prop_ids) {
        if (matched.includes(prop_id)) { continue }
        let resp_id = ranks[prop_id].find(id2 => !matched.includes(id2))
        matched.push(resp_id)
        matched.push(prop_id)
        matching[prop_id] = [resp_id]
    }
    return matching
}

function matching_different (prop_ids, resp_ids, ranks) {
    let matching = {}
    let resp_matched = []
    let prop_matched = []
    for (let prop_id of prop_ids) {
        if (prop_matched.includes(prop_id)) { continue }
        let resp_id = ranks[prop_id].find(id2 => !resp_matched.includes(id2) && resp_ids.includes(id2))
        if (resp_id === undefined) {
            matching[prop_id] = []
        } else {
            resp_matched.push(resp_id)
            prop_matched.push(prop_id)
            matching[prop_id] = [resp_id]
        }
    }
    return matching
}

function one_sided (past_sides) {  //FOR  NA//
    return past_sides.filter(side => side === 'gov').length - past_sides.filter(side => side === 'opp').length
}

function allocation_deepcopy(allocation) {
    var new_allocation = []
    //console.log(allocation)
    for (var square of allocation) {
        var {teams: teams, chairs: chairs=[], panels: panels=[], trainees: trainees=[], venue: venue=null, id: id} = square
        var new_square = {
            teams: teams,
            chairs:[].concat(chairs),
            panels: [].concat(panels),
            trainees: [].concat(trainees),
            venue: venue,
            id: id
        }
        new_allocation.push(new_square)
    }
    return new_allocation
}

function find_one(list, id) {
    return list.filter(e => e.id === id)[0]
}

function one_sided_bp(past_sides) {//the higher the worser
    if (past_sides.length === 0) {
        return [0, 0]
    } else {
        var opening = (math.count(past_sides, 'og') + math.count(past_sides, 'oo') - math.count(past_sides, 'cg') - math.count(past_sides, 'co'))/past_sides.length
        var gov = (math.count(past_sides, 'og') + math.count(past_sides, 'cg') - math.count(past_sides, 'oo') - math.count(past_sides, 'co'))/past_sides.length
        return [opening, gov]
    }
}

function square_one_sided_bp(past_sides_list) {//TESTED//
    var positions = ['og', 'oo', 'cg', 'co']
    var ind1 = 0
    var ind2 = 0
    for (var i = 0; i < positions.length; i++) {
        let [opening, gov] = one_sided_bp(past_sides_list[i].concat([positions[i]]))
        ind1 += Math.abs(opening)
        ind2 += Math.abs(gov)
    }
    return ind1 + ind2
}

function square_one_sided(past_sides_list) {//TESTED//
    var positions = ['gov', 'opp']
    var ind = 0
    for (var i = 0; i < positions.length; i++) {
        let g = one_sided(past_sides_list[i].concat([positions[i]]))
        ind += Math.abs(g)
    }
    return ind
}

function decide_positions(teams, compiled_team_results, config) {
    var past_sides_list = teams.map(id => find_one(compiled_team_results, id).past_sides)
    var decided_teams

    //if (config.style.team_num === 2) {
        if (one_sided(past_sides_list[0]) > one_sided(past_sides_list[1])) {//if team 0 does gov more than team b
            decided_teams = [teams[1], teams[0]]//team 1 does gov in the next round
        } else if (one_sided(past_sides_list[1]) > one_sided(past_sides_list[0])) {
            decided_teams = [teams[0], teams[1]]
        } else {
            decided_teams = teams
        }
    //} else if (config.style.team_num === 4) {//FOR BP
    //    var teams_list = math.permutator(teams)
    //    var vlist = teams_list.map(ids => square_one_sided_bp(ids.map(id => find_one(compiled_team_results, id).past_sides)))
    //
    //    decided_teams = teams_list[vlist.indexOf(Math.min(...vlist))]
    //}
    return decided_teams
}

function decide_positions_random(teams, compiled_team_results, config) {
    return math.shuffle(teams, config.name)
}

exports.get_ranks_absolute = get_ranks_absolute
exports.get_ranks_original = get_ranks_original
exports.get_ranks_straight = get_ranks_straight
exports.get_ranks_weighted = get_ranks_weighted
exports.get_ranks_weighted_linear = get_ranks_weighted_linear
exports.matching_same = matching_same
exports.matching_different = matching_different
exports.one_sided = one_sided
exports.allocation_deepcopy = allocation_deepcopy
exports.find_one = find_one
exports.one_sided_bp = one_sided_bp
exports.square_one_sided_bp = square_one_sided_bp
exports.square_one_sided = square_one_sided
exports.decide_positions = decide_positions
exports.decide_positions_random = decide_positions_random
