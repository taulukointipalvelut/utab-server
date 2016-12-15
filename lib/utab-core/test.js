"use strict";
var utab = require('./utab.js')
var random = require('./test/src/random.js')
var _ = require('underscore/underscore.js')
var styles = require('./src/general/styles.js')

async function wrap(pr, msg) {
    if (msg) console.log(msg);
    return await pr.then(console.log).catch(console.error)
}

async function test({
        create_teams: create_teams=true,
        total_round_num: total_round_num=10,
        id: id=1111111,
        create_adjudicators: create_adjudicators=true,
        create_venues: create_venues=true,
        create_debaters: create_debaters=true,
        proceed_rounds: proceed_rounds=true
    }, n=10) {

    utab.connect(id)

    //setTimeout(() => utab.config.configure({total_round_num: total_round_num, current_round_num: 1, style: {score_weights: [1, 1, 0.5]}}).then(console.log).catch(console.error), 500)

    if (create_teams) {
        for (var i = 0; i < n; i++) {
            await utab.teams.create({id: i}).catch(console.error)
        }
    }
    //console.log("teams")
    //await utab.teams.read().then(console.log).catch(console.error)

    if (create_debaters) {
        for (var i = 0; i < 2*n; i++) {
            await utab.debaters.create({id: i}).catch(console.error)
        }
    }
    //console.log("debaters")
    //await utab.debaters.read().then(console.log).catch(console.error)

    if (create_adjudicators) {
        for (var i = 0; i < n/2+1; i++) {
            await utab.adjudicators.create({id: i}).catch(console.error)
        }
    }

    //console.log("adjudicators")
    //await utab.adjudicators.read().then(console.log).catch(console.error)

    if (create_venues) {
        for (var i = 0; i < n/2+1; i++) {
            await utab.venues.create({id: i, priority: Math.floor(Math.random() * 3 + 1)}).catch(console.error)
        }
    }

    //console.log("venues")
    //await utab.venues.read().then(console.log).catch(console.error)

    if (proceed_rounds) {

        var debaters = await utab.debaters.read()
        var teams = await utab.teams.find({available: true})


        var teams_to_debaters = random.generate_teams_to_debaters(teams, debaters, _.range(1, total_round_num+1))

        for (var id in teams_to_debaters) {
            for (var r in teams_to_debaters[id]) {
                utab.teams.debaters.createIfNotExists({id: id, r: r, debaters: teams_to_debaters[id][r]})
            }
        }

        var style = styles[(await utab.config.read())['style']]

        for (var r = 1; r < total_round_num+1; r++) {
            var allocation = await utab.allocations.get({
                    simple: false,
                    with_venues: true,
                    with_adjudicators: true,
                    filters: ['by_strength', 'by_side', 'by_past_opponent', 'by_institution'],
                    filters_adj: ['by_conflict', 'by_institution', 'by_bubble'],
                    filters_adj: ['by_bubble', 'by_strength', 'by_attendance']
                })

            var teams = await utab.teams.find({available: true})
            var adjudicators = await utab.adjudicators.find({available: true})
            var debaters = await utab.debaters.read()


            var raw_debater_results = random.generate_raw_debater_results(allocation, debaters, teams_to_debaters, style, r)
            var raw_team_results = random.generate_raw_team_results(allocation, teams, style, r)
            var raw_adjudicator_results = random.generate_raw_adjudicator_results(allocation, r)

            for (var dr of raw_debater_results) {
                utab.debaters.results.create(dr).catch(console.error)
            }
            for (var tr of raw_team_results) {
                await utab.teams.results.create(tr).catch(console.error)
            }
            for (var ar of raw_adjudicator_results) {
                await utab.adjudicators.results.create(ar).catch(console.error)
            }

            if (r !== total_round_num) {
                await utab.config.proceed().then(console.log).catch(console.error)
            }

        }
    }
    setTimeout(utab.close, 30000)
}

var tournament = {
    id: 36324312,
    total_round_num: 3,
    create_teams: false,
    create_adjudicators: false,
    create_debaters: false,
    create_venues: false,
    proceed_rounds: true
}

var new_tournament = {
    id: 36324312,
    total_round_num: 3,
    create_teams: true,
    create_adjudicators: true,
    create_debaters: true,
    create_venues: true,
    proceed_rounds: false
}

function get_entities(n) {
    var entities = []
    for (var i = 0; i < n; i++) {
        entities.push({id: i})
    }
    return entities
}

function create_wrap(entities, t, f) {
    for (var entity of entities) {
        wrap(f(t).create(entity))
    }
}

async function test4(t1, {n: n=2, rounds: rounds=4, do_round: do_round=true, prepare: prepare=true, current_round_num: current_round_num=1}={}) {
    //wrap(utab.tournaments.read())
    //wrap(utab.tournaments.create({id: 223, name: "testtour"}))


    var style = {team_num: 2, score_weights: [1, 1, 0.5]}

    var teams = get_entities(n)
    var adjudicators = get_entities(n/2)
    var debaters = get_entities(n*2)
    var venues = get_entities(n/2)
    var institutions = get_entities(n)

    var raw_teams_to_debaters = random.generate_raw_teams_to_debaters(teams, debaters, [1], 2)
    var raw_teams_to_institutions = []
    var raw_adjudicators_to_institutions = []
    var raw_adjudicators_to_conflicts = []

    for (var team of teams) {
        raw_teams_to_institutions.push({id: team.id, institutions: []})
    }
    for (var adjudicator of adjudicators) {
        raw_adjudicators_to_institutions.push({id: adjudicator.id, institutions: []})
    }
    for (var adjudicator of adjudicators) {
        raw_adjudicators_to_conflicts.push({id: adjudicator.id, conflicts: []})
    }

    if (prepare) {
        create_wrap(teams, t1, x=>x.teams)
        create_wrap(debaters, t1, x=>x.debaters)
        create_wrap(venues, t1, x=>x.venues)
        create_wrap(institutions, t1, x=>x.institutions)
        create_wrap(adjudicators, t1, x=>x.adjudicators)
        create_wrap(raw_teams_to_institutions, t1, x=>x.teams.institutions)
        create_wrap(raw_adjudicators_to_institutions, t1, x=>x.adjudicators.institutions)
        create_wrap(raw_adjudicators_to_conflicts, t1, x=>x.adjudicators.conflicts)
        create_wrap(raw_teams_to_debaters, t1, x=>x.teams.debaters)
    }

    if (do_round) {
        for (var r = current_round_num; r < rounds+1; r++) {
            var a = await t1.allocations.get()
            console.log(a)
            //t1.adjudicators.results.create({id: 1, r: 1, from_id: 1, score: 1, judged_teams: [1]}).then(console.log).catch(console.error)
            try {
                var raw_teams_to_debaters = await t1.teams.debaters.read()
                await create_wrap(random.generate_raw_debater_results(a, raw_teams_to_debaters, style, r), t1, x=>x.debaters.results)
                await create_wrap(random.generate_raw_adjudicator_results(a, r), t1, x=>x.adjudicators.results)
                await create_wrap(random.generate_raw_team_results(a, style, r), t1, x=>x.teams.results)
            }catch(e){
                console.error(e)
            }

            if (r < rounds) {
                await t1.config.proceed().then(console.log).catch(console.error)
            } else {
                await t1.teams.results.organize(_.range(1, rounds+1)).then(console.log).catch(console.error)
                await t1.adjudicators.results.organize(_.range(1, rounds+1)).then(console.log).catch(console.error)

                await t1.debaters.results.organize(_.range(1, rounds+1)).then(console.log).catch(console.error)
            }
        }
    }
}

var t1 = new utab.TournamentHandler(db_url: 'mongodb://localhost/testtournament233333')//, {name: "newt", style_name: 'NA', current_round_num: 1})
setTimeout(t1.close, 20000)
//t1.config.read().then(console.log)
//t1.config.update({name: 'newtour', style: 'NA'}).then(console.log)

//t1.teams.create({name: "hier"}, true).then(console.log).catch(console.error)
//t1.allocations.teams.get().then(console.log)
//t1.institutions.read().then(console.log)
//t1.teams.institutions.create({id: 134898433197913, institutions: [158335321521362]})
//t1.teams.debaters.create({id: 39613078088947, r: 1, debaters: [1, 2]}).then(console.log)
//t1.teams.read().then(console.log)
//t1.teams.debaters.read().then(console.log)
//t1.config.proceed().then(console.log)
//t1.config.read().then(console.log)
//t1.teams.update({id: 6338092494231545, available: false}).then(console.log).catch(console.error)
//t1.teams.delete({id: 633809249423154}).then(console.log).catch(console.error)
//utab.tournaments.findOne({id: id}).then(console.log);
//utab.tournaments.update({id: id, current_round_num: 1});
//test4(t1, {prepare: false, do_round: true, current_round_num: 1, rounds: 2})


//t1.adjudicators.results.create({id: 1, r: 1, from_id: 1, score: 1, judged_teams: [1]}).then(console.log).catch(console.error)
/*
;(async function () {
    var style = styles['NA']
    var r = 2
    var a = await t1.allocations.get()
    console.log(a)
    var raw_teams_to_debaters = await t1.teams.debaters.read()
    await create_wrap(random.generate_raw_debater_results(a, raw_teams_to_debaters, style, r), t1, x=>x.debaters.results)
    await create_wrap(random.generate_raw_adjudicator_results(a, r), t1, x=>x.adjudicators.results)
    await create_wrap(random.generate_raw_team_results(a, style, r), t1, x=>x.teams.results)

    await t1.teams.results.organize(_.range(1, r+1)).then(console.log).catch(console.error)
    await t1.adjudicators.results.organize(_.range(1, r+1)).then(console.log).catch(console.error)
    await t1.debaters.results.organize(_.range(1, r+1)).then(console.log).catch(console.error)
    //await t1.config.proceed().then(console.log).catch(console.error)
})();
*/
