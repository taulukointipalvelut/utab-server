"use strict";
var math = require('./lib/utab-core/src/general/math.js')
var tools = require('./lib/utab-core/src/general/tools.js')

function generate_raw_team_results(allocation, style, r) {//FOR NA //TESTED//
	if (style.team_num === 4) {
        var sides = ["og", "oo", "cg", "co"]
    } else {
	    var sides = ["gov", "opp"]
    }

	//team_result = {}
    var raw_team_result_list = []

    var c = 0
    for (var square of allocation) {
        var sides_cp = math.shuffle([].concat(sides))
        var win = Math.floor(Math.random()*2)
        //try {
        //    console.log(teams.map(t=>t.id))
        //} catch(e) {
        //    console.eror(e)
        //}
        //console.log("f")

        raw_team_result_list.push({
            id: square.teams[0],
            from_id: c,
            r: r,
            win: win,
            side: sides_cp[0],
            opponents: square.teams[1]
        })

        raw_team_result_list.push({
            id: square.teams[1],
            from_id: c,
            r: r,
            win: 1-win,
            side: sides_cp[1],
            opponents: square.teams[0]
        })
        c += 1
    }
    return raw_team_result_list
}

function generate_raw_debater_results(allocation, teams, style, r) {//TESTED//
	var raw_debater_results = []

    var c = 0
    for (var square of allocation) {
        for (var id of square.teams) {
            var same_team_debaters = tools.find_and_access_detail(teams, id, r).debaters
            var list_to_share = style.score_weights.map(w => Math.floor((Math.random()* 9 + 71)*w))

            var score_lists = []

            for (var j = 0; j < list_to_share.length; j++) {//for each role
                var n = Math.floor(Math.random()*same_team_debaters.length)
                for (var i = 0; i < same_team_debaters.length; i++) {//for each debater
                    if (j === 0) {
                        score_lists[i] = []
                    }

                    if (i === n) {
                        score_lists[i].push(list_to_share[j])
                    } else {
                        score_lists[i].push(0)
                    }
                }
            }

            for (var i = 0; i < same_team_debaters.length; i++) {
                raw_debater_results.push({
                    id: same_team_debaters[i],
                    from_id: c,
                    r: r,
                    scores: score_lists[i]
                })
            }
        }
        c += 1
    }
    return raw_debater_results
}

//console.log(generate_raw_debater_results([{teams: [0, 1]}], [{ id: 0, r: 1, debaters: [ 0, 1 ] }, { id: 1, r: 1, debaters: [ 2, 3 ] }], {team_num: 2, score_weights: [1, 1, 0.5]}, 1))

function generate_raw_adjudicator_results(allocation, r) {//TESTED//
    var raw_adjudicator_results = []
    for (var square of allocation) {
        for (var id of square.chairs.concat(square.panels).concat(square.trainees)) {
            square.teams.map(t_id =>
                raw_adjudicator_results.push({
                    r: r,
                    id: id,
                    from_id: t_id,
                    score: Math.floor(1 + 9 * Math.random()),
                    watched_teams: square.teams
                })
            )
        }
    }
    return raw_adjudicator_results
}

function generate_entities(sym, n) {
    let entities = []
    for (let i = 0; i < n; i++) {
        entities.push({
            name: sym+i.toString()
        })
    }
    return entities
}

let generate_debaters = n => generate_entities("d", 2*n)

let generate_venues = n => generate_entities("v", int(n/2+1))

let generate_institutions = n => generate_entities("i", int(n/2))

let generate_adjudicators = n => generate_entities("i", int(n * 3 / 2 + 1))

let generate_teams = n => generate_entities("t", n)

function set_details(entity, prop, list, rounds) {
	entity.details = []
	for (let r = 0; r < rounds; r++) {
		let dict = {r: r+1}
		dict[prop] = list
		entity.details.push(dict)
	}
	return entity
}

//console.log(set_details({name: 1}, 'debaters', [1, 2], 4))
//console.log(generate_raw_adjudicator_results([{teams: [1, 2], chairs: [2]}], 1))
