"use strict";

var loggers = require('./general/loggers.js')
var errors = require('./general/errors.js')
var handlers = require('./controllers/handlers.js')
var _ = require('underscore/underscore.js')

class CON {
    constructor(db_url, options) {
        this.dbh = new handlers.DBHandler(db_url, options)

        var con = this

        this.draws = {
            read: function () {
                return con.dbh.draws.read.call(con.dbh.draws)
            },
            create: function (dict) {
                return con.dbh.draws.create.call(con.dbh.draws, dict)
            },
            delete: function (dict) {
                return con.dbh.draws.delete.call(con.dbh.draws, dict)
            },
            find: function(dict) {
                return con.dbh.draws.find.call(con.dbh.draws, dict)
            },
            update: function(dict) {
                return con.dbh.draws.update.call(con.dbh.draws, dict)
            }
        }
        this.rounds = {
            read: function () {
                return con.dbh.rounds.read.call(con.dbh.rounds)
            },
            create: function (dict) {
                return con.dbh.rounds.create.call(con.dbh.rounds, dict)
            },
            delete: function (dict) {
                return con.dbh.rounds.delete.call(con.dbh.rounds, dict)
            },
            find: function(dict) {
                return con.dbh.rounds.find.call(con.dbh.rounds, dict)
            },
            update: function(dict) {
                return con.dbh.rounds.update.call(con.dbh.rounds, dict)
            },
            findOne: function(dict) {
                return con.dbh.rounds.findOne.call(con.dbh.rounds, dict)
            },
        }
        this.config = {
            read: function() {//TESTED//
                return con.dbh.config.read.call(con.dbh.config)
            },
            update: function(dict) {//set styles//TESTED//
                return con.dbh.config.update.call(con.dbh.config, dict)
            }
        }
        this.teams = {
            read: function () {
                return con.dbh.teams.read.call(con.dbh.teams)
            },
            create: function (dict, force=false) {
                return con.dbh.teams.create.call(con.dbh.teams, dict, force)
            },
            delete: function (dict) {
                return con.dbh.teams.delete.call(con.dbh.teams, dict)
            },
            find: function(dict) {
                return con.dbh.teams.find.call(con.dbh.teams, dict)
            },
            findOne: function(dict) {
                return con.dbh.teams.findOne.call(con.dbh.teams, dict)
            },
            update: function(dict) {
                return con.dbh.teams.update.call(con.dbh.teams, dict)
            },
            results: {
                read: function () {
                    return con.dbh.raw_team_results.read.call(con.dbh.raw_team_results)
                },
                create: function (dict) {
                    return con.dbh.raw_team_results.create.call(con.dbh.raw_team_results, dict)
                },
                update: function (dict) {
                    return con.dbh.raw_team_results.update.call(con.dbh.raw_team_results, dict)
                },
                delete: function (dict) {
                    return con.dbh.raw_team_results.delete.call(con.dbh.raw_team_results, dict)
                },
                find: function (dict) {
                    return con.dbh.raw_team_results.find.call(con.dbh.raw_team_results, dict)
                },
                findOne: function (dict) {
                    return con.dbh.raw_team_results.findOne.call(con.dbh.raw_team_results, dict)
                }
            }
        }
        this.adjudicators = {
            read: function () {
                return con.dbh.adjudicators.read.call(con.dbh.adjudicators)
            },
            create: function (dict, force=false) {
                return con.dbh.adjudicators.create.call(con.dbh.adjudicators, dict, force)
            },
            delete: function (dict) {
                return con.dbh.adjudicators.delete.call(con.dbh.adjudicators, dict)
            },
            update: function (dict) {
                return con.dbh.adjudicators.update.call(con.dbh.adjudicators, dict)
            },
            find: function(dict) {
                return con.dbh.adjudicators.find.call(con.dbh.adjudicators, dict)
            },
            findOne: function(dict) {
                return con.dbh.adjudicators.findOne.call(con.dbh.adjudicators, dict)
            },
            results: {
                read: function () {
                    return con.dbh.raw_adjudicator_results.read.call(con.dbh.raw_adjudicator_results)
                },
                create: function (dict) {
                    return con.dbh.raw_adjudicator_results.create.call(con.dbh.raw_adjudicator_results, dict)
                },
                update: function (dict) {
                    return con.dbh.raw_adjudicator_results.update.call(con.dbh.raw_adjudicator_results, dict)
                },
                delete: function (dict) {
                    return con.dbh.raw_adjudicator_results.delete.call(con.dbh.raw_adjudicator_results, dict)
                },
                find: function (dict) {
                    return con.dbh.raw_adjudicator_results.find.call(con.dbh.raw_adjudicator_results, dict)
                },
                findOne: function (dict) {
                    return con.dbh.raw_adjudicator_results.findOne.call(con.dbh.raw_adjudicator_results, dict)
                }
            }
        }
        this.venues = {
            read: function () {
                return con.dbh.venues.read.call(con.dbh.venues)
            },
            create: function (dict, force=false) {
                return con.dbh.venues.create.call(con.dbh.venues, dict, force)
            },
            delete: function (dict) {
                return con.dbh.venues.delete.call(con.dbh.venues, dict)
            },
            find: function (dict) {
                return con.dbh.venues.find.call(con.dbh.venues, dict)
            },
            findOne: function (dict) {
                return con.dbh.venues.findOne.call(con.dbh.venues, dict)
            },
            update: function (dict) {
                return con.dbh.venues.update.call(con.dbh.venues, dict)
            }
        }
        this.debaters = {
            read: function () {
                return con.dbh.debaters.read.call(con.dbh.debaters)
            },
            create: function (dict, force=false) {
                return con.dbh.debaters.create.call(con.dbh.debaters, dict, force)
            },
            delete: function (dict) {
                return con.dbh.debaters.delete.call(con.dbh.debaters, dict)
            },
            update: function (dict) {
                return con.dbh.debaters.update.call(con.dbh.debaters, dict)
            },
            find: function (dict) {
                return con.dbh.debaters.find.call(con.dbh.debaters, dict)
            },
            findOne: function (dict) {
                return con.dbh.debaters.findOne.call(con.dbh.debaters, dict)
            },
            results: {
                read: function () {
                    return con.dbh.raw_debater_results.read.call(con.dbh.raw_debater_results)
                },
                create: function (dict) {
                    return con.dbh.raw_debater_results.create.call(con.dbh.raw_debater_results, dict)
                },
                update: function (dict) {
                    return con.dbh.raw_debater_results.update.call(con.dbh.raw_debater_results, dict)
                },
                delete: function (dict) {
                    return con.dbh.raw_debater_results.delete.call(con.dbh.raw_debater_results, dict)
                },
                find: function (dict) {
                    return con.dbh.raw_debater_results.find.call(con.dbh.raw_debater_results, dict)
                }
            }
        }
        this.institutions = {
            read: function () {
                return con.dbh.institutions.read.call(con.dbh.institutions)
            },
            create: function (dict, force=false) {
                return con.dbh.institutions.create.call(con.dbh.institutions, dict, force)
            },
            delete: function (dict) {
                return con.dbh.institutions.delete.call(con.dbh.institutions, dict)
            },
            find: function (dict) {
                return con.dbh.institutions.find.call(con.dbh.institutions, dict)
            },
            findOne: function (dict) {
                return con.dbh.institutions.findOne.call(con.dbh.institutions, dict)
            },
            update: function (dict) {
                return con.dbh.institutions.update.call(con.dbh.institutions, dict)
            }
        }
        this.close = con.dbh.close.bind(con.dbh)
    }
}

exports.CON = CON
