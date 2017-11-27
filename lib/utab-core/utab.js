"use strict";

const loggers = require('./src/general/loggers.js')//Must be the first to require
loggers.init()
const alloc = require('./src/allocations.js')
const res = require('./src/results.js')
const DBHandler = require('./src/controllers.js')
const _ = require('underscore/underscore.js')

function values (obj) {
    return Object.keys(obj).map(key => obj[key])
}

class Utab extends DBHandler {
    constructor (db_url) {
        loggers.results('constructor of TournamentsHandler is called')
        loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))

        super(db_url)
        let that = this
        function teams_organize (tournament_id, rs, {simple: simple=false, force: force=false}={}) {
            loggers.results('teams.results.organize is called')
            loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))
            return Promise.all([that.teams.read(tournament_id), that.speakers.read(tournament_id), that.teams.results.read(tournament_id), that.speakers.results.read(tournament_id), that.draws.read(tournament_id), that.configs.readOne(tournament_id)]).then(function (vs) {
                var [teams, speakers, raw_team_results, raw_speaker_results, draws, config] = vs

                if (!force) {
                    rs.map(r => res.teams.precheck(raw_team_results, teams, r))
                    rs.map(r => res.speakers.precheck(raw_speaker_results, speakers, r))
                }
                if (simple) {
                    return res.teams.simple_compile(teams, raw_team_results, draws, rs, config.style)
                } else {
                    return res.teams.compile(teams, speakers, raw_team_results, raw_speaker_results, draws, rs, config.style)
                }
            })
        }
        function adjudicators_organize (tournament_id, rs) {
            loggers.results('adjudicators.results.organize is called')
            loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))
            return Promise.all([that.adjudicators.read(tournament_id), that.adjudicators.results.read(tournament_id), that.draws.read(tournament_id), that.configs.readOne(tournament_id)]).then(function(vs) {
                var [adjudicators, raw_adjudicator_results, draws, config] = vs

                var team_num = 2//config.style.team_num
                return res.adjudicators.compile(adjudicators, raw_adjudicator_results, draws, rs)
            })
        }
        function speakers_organize (tournament_id, rs) {
            loggers.results('speakers.results.organize is called')
            loggers.results('debug', 'arguments are: '+JSON.stringify(arguments))
            return Promise.all([that.speakers.read(tournament_id), that.speakers.results.read(tournament_id), that.configs.readOne(tournament_id)]).then(function(vs) {
                var [speakers, raw_speaker_results, config] = vs

                var team_num = 2//config.style.team_num
                return res.speakers.compile(speakers, raw_speaker_results, config.style, rs)
            })
        }
        this.teams.results.organize = teams_organize
        this.adjudicators.results.organize = adjudicators_organize
        this.speakers.results.organize = speakers_organize
        this.draws.get =
            function(tournament_id, _for, options={}) {
                loggers.draws('draws.get is called')
                loggers.draws('debug', 'arguments are: '+JSON.stringify(arguments))
                return Promise.all([that.configs.readOne(tournament_id)])
                    .then(function(vs) {
                        var [config] = vs

                        var options_for_team_allocation = _.clone(options)
                        var options_for_adjudicator_allocation = _.clone(options)
                        var options_for_venue_allocation = _.clone(options)
                        if (options.hasOwnProperty('team_allocation_algorithm')) {
                            options_for_team_allocation.algorithm = options.team_allocation_algorithm
                        }
                        if (options.hasOwnProperty('team_allocation_algorithm_options')) {
                            options_for_team_allocation.algorithm_options = options.team_allocation_algorithm_options
                        }
                        if (options.hasOwnProperty('adjudicator_allocation_algorithm')) {
                            options_for_adjudicator_allocation.algorithm = options.adjudicator_allocation_algorithm
                        }
                        if (options.hasOwnProperty('adjudicator_allocation_algorithm_options')) {
                            options_for_adjudicator_allocation.algorithm_options = options.adjudicator_allocation_algorithm_options
                        }
                        if (options.hasOwnProperty('venue_allocation_algorithm_options')) {
                            options_for_venue_allocation.algorithm_options = options.adjudicator_allocation_algorithm_options
                        }

                        return that.draws.teams.get(tournament_id, _for, options_for_team_allocation)
                            .then(function (team_draw) {
                                return that.draws.adjudicators.get(tournament_id, _for, team_draw, options_for_adjudicator_allocation)
                            })
                            .then(function (adjudicator_draw) {
                                return that.draws.venues.get(tournament_id, _for, adjudicator_draw, options_for_venue_allocation)
                            })
                    })
            }
        this.draws.teams = {
            get: function(tournament_id, _for, {
                    simple: simple = false,
                    force: force=false, // ignores warnings
                    algorithm: algorithm = 'standard',
                    algorithm_options: algorithm_options = {},
                    by: by
                }={}) {
                loggers.draws('draws.teams.get is called')
                loggers.draws('debug', 'arguments are: '+JSON.stringify(arguments))
                let rs = by !== undefined ? by : _.range(1, _for)
                return Promise.all([that.configs.readOne(tournament_id), that.teams.read(tournament_id), that.teams.results.organize(tournament_id, rs, {simple, force}), that.institutions.read(tournament_id)])
                    .then(function (vs) {
                        var [config, teams, compiled_team_results, institutions] = vs
                        var team_num = 2//config.style.team_num
                        alloc.teams.precheck(teams, institutions, config.style, _for)
                        if (algorithm === 'standard') {
                            var draw = alloc.teams.standard.get(_for, teams, compiled_team_results, algorithm_options, config)
                        } else {
                            var draw = alloc.teams.strict.get(_for, teams, compiled_team_results, config, algorithm_options)
                        }
                        return draw
                    })
            }
        }
        this.draws.adjudicators = {
            get: function(tournament_id, _for, draw, {
                    by: by,
                    simple: simple = false,
                    force: force = false,
                    algorithm: algorithm = 'standard',
                    algorithm_options: algorithm_options = {},
                    numbers_of_adjudicators: numbers_of_adjudicators = {chairs: 1, panels: 0, trainees: 0}
                }={}) {
                loggers.draws('draws.adjudicators.get is called')
                loggers.draws('debug', 'arguments are: '+JSON.stringify(arguments))
                let rs = by !== undefined ? by : _.range(1, _for)
                return Promise.all([that.configs.readOne(tournament_id), that.teams.read(tournament_id), that.adjudicators.read(tournament_id), that.institutions.read(tournament_id), that.teams.results.organize(tournament_id, rs, {simple, force}), that.adjudicators.results.organize(tournament_id, rs)])
                    .then(function (vs) {
                        var [config, teams, adjudicators, institutions, compiled_team_results, compiled_adjudicator_results] = vs

                        if (algorithm === 'standard') {
                            var new_draw = alloc.adjudicators.standard.get(_for, draw, adjudicators, teams, compiled_team_results, compiled_adjudicator_results, numbers_of_adjudicators, config, algorithm_options)
                        } else if (algorithm === 'traditional') {
                            var new_draw = alloc.adjudicators.traditional.get(_for, draw, adjudicators, teams, compiled_team_results, compiled_adjudicator_results, numbers_of_adjudicators, config, algorithm_options)
                        }
                        return new_draw
                    })
            }
        }
        this.draws.venues = {
            get: function(tournament_id, _for, draw, {by: by, simple: simple=false, force: force=false, shuffle: shuffle=false}) {
                loggers.draws('draws.venues.get is called')
                loggers.draws('debug', 'arguments are: '+JSON.stringify(arguments))
                let rs = by !== undefined ? by : _.range(1, _for)

                return Promise.all([that.configs.readOne(tournament_id), that.teams.read(tournament_id), that.venues.read(tournament_id), that.teams.results.organize(tournament_id, rs, {simple, force})])
                    .then(function (vs) {
                        var [config, teams, venues, compiled_team_results] = vs

                        var new_draw = alloc.venues.standard.get(_for, draw, venues, compiled_team_results, config, shuffle)
                        //new_draw = checks.draws.venues.check(new_draw, venues)

                        return new_draw
                    })
            }
        }
    }
}

module.exports = Utab
