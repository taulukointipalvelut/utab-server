"use strict";
var math = require('../../general/math.js')
var sys = require('../sys.js')
var _ = require('underscore')
var loggers = require('../../general/loggers.js')

function add_information_to_division(division, config) {
    var div = [].concat(division)
    let team_num = config.style.team_num
    div[0].out = 0
    div[0].consider = true
    div[0].in = div[0].teams.length % team_num === 0 ? 0 : team_num - div[0].teams.length % team_num

    var now_in = div[0].in
    for (var i = 1; i < div.length - 1; i++) {
        if (div[i].teams.length < now_in) {
            div[i].out = div[i].teams.length
            now_in -= div[i].teams.length
            div[i].consider = false
            //div[i].in = 0
        } else {
            div[i].out = now_in
            div[i].consider = true
            var remaining = div[i].teams.length - div[i].out
            //div[i].in = remaining % team_num === 0 ? 0 : team_num - remaining
            now_in = remaining % team_num === 0 ? 0 : team_num - remaining
        }
    }

    div[div.length-1].out = Math.min(now_in, div[div.length-1].teams.length)
    div[div.length-1].consider = div[div.length-1].teams.length - div[div.length-1].out > 0 ? true : false
    //div[div.length-1].in = 0

    return div
}

function match(div, pullup_func, config) {
    loggers.silly_logger(match, arguments, 'draws', __filename)
    let div_cp = _.clone(div)
    let matching_pool = []
    let matched = div[0].teams
    for (var i = 1; i < div_cp.length-1; i++) {
        if (div_cp[i].consider) {
            var [chosen, rem] = pullup_func(div_cp[i], config)
            div_cp[i].teams = rem
            matched = matched.concat(chosen)
            if (rem.length > 0) {
                matching_pool.push([].concat(matched))
                matched = []
            }
        }
    }
    if (div_cp[div_cp.length-1].consider) {
        matching_pool.push(div_cp[div_cp.length-1])
    }
    return matching_pool
}

let pullup_funcs = {
    fromtop: pullup_func_fromtop,
    frombottom: pullup_func_frombottom,
    random: pullup_func_random
}

let pairing_funcs = {
    random: pairing_func_random,
    fold: pairing_func_fold,
    slide: pairing_func_slide,
    sort: pairing_func_sort,
    adjusted: pairing_func_adjusted
}

let position_funcs = {
    random: sys.decide_positions_random,
    adjusted: sys.decide_positions
}

function strict_matching(teams, compiled_team_results, config, {pairing_method: pairing_method='random', pullup_method: pullup_method='fromtop', position_method: position_method='adjusted', avoid_conflict: avoid_conflict=true}) {
    loggers.silly_logger(strict_matching, arguments, 'draws', __filename)
    if (teams.length === 0) {
        return {}
    }
    var div = []
    var wins = Array.from(new Set(compiled_team_results.map(ctr => ctr.win)))
    var team_ids = teams.map(t => t.id)
    wins.sort()

    for (var win of wins) {
        var same_win_teams = team_ids.filter(id => sys.find_one(compiled_team_results, id).win === win)
        div.push({win: win, teams: same_win_teams})
    }

    div = add_information_to_division(div, config)

    let matching_pool = match(div, pullup_funcs[pullup_method], config)
    let pre_matching = Array.prototype.concat.apply([], matching_pool.map(pool => pairing_funcs[pairing_method](pool.teams, config, compiled_team_results)))

    let matching = pre_matching.map(ts => position_funcs[position_method](ts, compiled_team_results, config))

    if (avoid_conflict) {
        var final = resolve_dp(teams, matching, compiled_team_results)///////////NEED TO BE FIXED//////
    } else {
        var final = matching
    }

    return final
}

function pullup_func_fromtop(d, config) {///TESTED///
    return [d.slice(0, d.out), d.slice(d.out)]
}

function pullup_func_frombottom(d, config) {///TESTED///
    let e = [].concat(d)
    e.reverse()
    return [e.slice(0, d.out), e.slice(d.out)]
}

function pullup_func_random(d, config) {
    let e = math.shuffle(d, config.name)
    return [e.slice(0, d.out), e.slice(d.out)]
}

function pairing_func_random(teams, config, compiled_team_results) {///TESTED///
    let shuffled_teams = math.shuffle(teams, config.name)
    return pairing_func_sort(shuffled_teams, config)
}

function pairing_func_fold(teams, config, compiled_team_results) {///TESTED///
    let matched = []
    let divided = divide_into(teams, config.style.team_num)
    for (let j = config.style.team_num-1; j >= config.style.team_num/2; j--) {
        divided[j].reverse()
    }
    for (let i = 0; i < teams.length/team_num; i++) {
        matched.push(divided.map(div => div.filter((x, j) => j === i)[0]))
    }
    return matched
}

function pairing_func_slide(teams, config, compiled_team_results) {///TESTED///
    let matched = []
    let divided = divide_into(teams, config.style.team_num)
    for (let i = 0; i < teams.length/config.style.team_num; i++) {
        matched.push(divided.map(div => div.filter((x, j) => j === i)[0]))
    }
    return matched
}

function pairing_func_sort(teams, config, compiled_team_results) {///TESTED///
    let matched = divide_into(teams, teams.length/config.style.team_num)
    return matched
}

function pairing_func_adjusted(teams, config, compiled_team_results) {
    let all_cs = divide_comb(teams, config.style.team_num)
    all_divs = all_cs.map(c => divide_into(c, teams.length/config.style.team_num))

    let measures = []
    for (let divs of all_divs) {//for each candidate divisions
        let measure = 0
        for (let div of divs) {
            let cs = math.combinations(div, div.length)
            let past_sides_list_list = cs.map(c => c.map(t => sys.find_one(compiled_team_results, t.id).past_sides))
            if (config.style.team_num === 4) {
                measure += Math.min(...past_sides_list_list.map((past_sides_list, i) => sys.square_one_sided_bp(past_sides_list.map((past_sides, j) => past_sides))))
            } else if (config.style.team_num === 2) {
                measure += Math.min(...past_sides_list_list.map((past_sides_list, i) => sys.square_one_sided(past_sides_list.map((past_sides, j) => past_sides))))
            }
        }
        measures.push(measure)
    }
    //console.log(measures)
    return all_divs[measures.indexOf(Math.max(...measures))]
}

function divide_comb(list, num) {///TESTED/// //returns necessary combinations of pooled teams
    if (list.length === num) {
        return [list]
    } else {
        let heads = math.combinations(list, num)
        return Array.prototype.concat.apply([], heads.map(head => divide_comb(list.filter(e => !math.isin(e, head)), num).map(t => head.concat(t))))
    }
}
//console.log(divide_comb([1, 2, 3, 4], 2))
//console.log(pairing_func_adjusted([{id: 1}, {id: 2}, {id: 3}, {id: 4}], {name: "test", style: {team_num: 2}}, [{id: 1, past_sides: ['gov', 'opp']}, {id: 2, past_sides: ['gov', 'opp']}, {id: 3, past_sides: ['gov', 'opp']}, {id: 4, past_sides: ['gov', 'opp']}]))
//console.log(pairing_func_adjusted([{id: 1}, {id: 2}, {id: 3}, {id: 4}], {name: "test", style: {team_num: 4}}, [{id: 1, past_sides: ['og', 'co']}, {id: 2, past_sides: ['og', 'co']}, {id: 3, past_sides: ['og', 'co']}, {id: 4, past_sides: ['oo', 'cg']}]))

function divide_into(list, num) {///TESTED///
    var divided = []
    var in_div = list.length/num
    for (var j = 0; j < num; j++) {
        divided.push(list.slice(j*in_div, (j+1)*in_div))
    }
    return divided
}

function resolve_dp(teams, matching, compiled_team_results) {//dp
    //list all swapped_matching
    //count swap, conflicts
    for (let ts of matching) {
        //IF CONFLICT
        //SWAP WITH THE NEXT ts FOR EACH t in CURRENT ts
        //  IF swapped is better
        //
    }
    return matching
}


/*
function get_ors(team_num, i, p) {
    if (i !== 0) {
        if (p === 0) {
            return [[0, 0], [0, -1], [-1, 0]]
        } else if (p === 1) {
            return [[0, 1], [1, 0], [1, -1], [-1, 1]]
        }
    } else {
        return [[0, 0], [-1, 0], [0, -1]]
    }
}

function get_orsf(team_num, i, p) {
    if (p === 0) {
        return [[0, 0]]
    } else if (p === 1) {
        return [[1, 0], [0, 1]]
    }
}

function get_all_pm_combinations(divs, team_num, prior_or=undefined, i=0) {
    let p = prior_or ? prior_or.filter(r => r < 0).length : 0
    //console.log(prior_or, p)
    if (i === divs.length-1) {
        return get_orsf(team_num, i, p).map(or => [or])
    } else {
        return Array.prototype.concat.apply([], get_ors(team_num, i, p).map(or => get_all_pm_combinations(divs, team_num, or, i+1).map(next_or => [or].concat(next_or))))
    }
}*/

//console.log(get_all_pm_combinations([[1, 2], [3, 4], [5, 6]], 2))

//divide_into([1, 2, 3, 4], 2), [[1, 2], [3, 4]]
//divide_into([1, 2, 3, 4], 4) === [[1, 2, 3, 4]]
//pairing_func_slide([1, 2, 3, 4], {style: {team_num: 2}}) === [[1, 3], [2, 4]]
//pairing_func_slide([1, 2, 3, 4], {style: {team_num: 4}}) === [[1, 2, 3, 4]]
//pairing_func_sort([1, 2, 3, 4], {style: {team_num: 2}}) === [[1, 2], [3, 4]]
//pairing_func_sort([1, 2, 3, 4], {style: {team_num: 4}}) === [[1, 2, 3, 4]]
//pairing_func_fold([1, 2, 3, 4], {style: {team_num: 2}}) === [[1, 4], [2, 3]]
//pairing_func_fold([1, 2, 3, 4], {style: {team_num: 4}}) === [[1, 2, 3, 4]]
//let d = [1, 2, 3, 4]
//d.out = 3
//pullup_func_fromtop(d) === [[1, 2, 3], [4]]
//pullup_func_frombottom(d) === [[4, 3, 2], [1]]
//d.out = 4
//pullup_func_fromtop(d) === [[1, 2, 3, 4], []]
//pullup_func_frombottom(d) === [[4, 3, 2, 1], []]

exports.strict_matching = strict_matching
