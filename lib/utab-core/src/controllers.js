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
            read: con.dbh.draws.read.bind(con.dbh.draws),
            create: con.dbh.draws.create.bind(con.dbh.draws),
            delete: con.dbh.draws.delete.bind(con.dbh.draws),
            find: con.dbh.draws.find.bind(con.dbh.draws),
            update: con.dbh.draws.update.bind(con.dbh.draws)
        }
        this.rounds = {
            read: con.dbh.rounds.read.bind(con.dbh.rounds),
            create: con.dbh.rounds.create.bind(con.dbh.rounds),
            delete: con.dbh.rounds.delete.bind(con.dbh.rounds),
            find: con.dbh.rounds.find.bind(con.dbh.rounds),
            update: con.dbh.rounds.update.bind(con.dbh.rounds),
            findOne: con.dbh.rounds.findOne.bind(con.dbh.rounds)
        }
        this.config = {
            read: con.dbh.config.read.bind(con.dbh.config),
            update: con.dbh.config.update.bind(con.dbh.config)
        }
        this.teams = {
            read: con.dbh.teams.read.bind(con.dbh.teams),
            create: con.dbh.teams.create.bind(con.dbh.teams),
            delete: con.dbh.teams.delete.bind(con.dbh.teams),
            find: con.dbh.teams.find.bind(con.dbh.teams),
            findOne: con.dbh.teams.findOne.bind(con.dbh.teams),
            update: con.dbh.teams.update.bind(con.dbh.teams),
            results: {
                read: con.dbh.raw_team_results.read.bind(con.dbh.raw_team_results),
                create: con.dbh.raw_team_results.create.bind(con.dbh.raw_team_results),
                update: con.dbh.raw_team_results.update.bind(con.dbh.raw_team_results),
                delete: con.dbh.raw_team_results.delete.bind(con.dbh.raw_team_results),
                find: con.dbh.raw_team_results.find.bind(con.dbh.raw_team_results),
                findOne: con.dbh.raw_team_results.findOne.bind(con.dbh.raw_team_results)
            }
        }
        this.adjudicators = {
            read: con.dbh.adjudicators.read.bind(con.dbh.adjudicators),
            create: con.dbh.adjudicators.create.bind(con.dbh.adjudicators),
            delete: con.dbh.adjudicators.delete.bind(con.dbh.adjudicators),
            update: con.dbh.adjudicators.update.bind(con.dbh.adjudicators),
            find: con.dbh.adjudicators.find.bind(con.dbh.adjudicators),
            findOne: con.dbh.adjudicators.findOne.bind(con.dbh.adjudicators),
            results: {
                read: con.dbh.raw_adjudicator_results.read.bind(con.dbh.raw_adjudicator_results),
                create: con.dbh.raw_adjudicator_results.create.bind(con.dbh.raw_adjudicator_results),
                update: con.dbh.raw_adjudicator_results.update.bind(con.dbh.raw_adjudicator_results),
                delete: con.dbh.raw_adjudicator_results.delete.bind(con.dbh.raw_adjudicator_results),
                find: con.dbh.raw_adjudicator_results.find.bind(con.dbh.raw_adjudicator_results),
                findOne: con.dbh.raw_adjudicator_results.findOne.bind(con.dbh.raw_adjudicator_results)
            }
        }
        this.venues = {
            read: con.dbh.venues.read.bind(con.dbh.venues),
            create: con.dbh.venues.create.bind(con.dbh.venues),
            delete: con.dbh.venues.delete.bind(con.dbh.venues),
            find: con.dbh.venues.find.bind(con.dbh.venues),
            findOne: con.dbh.venues.findOne.bind(con.dbh.venues),
            update: con.dbh.venues.update.bind(con.dbh.venues)
        }
        this.debaters = {
            read: con.dbh.debaters.read.bind(con.dbh.debaters),
            create: con.dbh.debaters.create.bind(con.dbh.debaters),
            delete: con.dbh.debaters.delete.bind(con.dbh.debaters),
            update: con.dbh.debaters.update.bind(con.dbh.debaters),
            find: con.dbh.debaters.find.bind(con.dbh.debaters),
            findOne: con.dbh.debaters.findOne.bind(con.dbh.debaters),
            results: {
                read: con.dbh.raw_debater_results.read.bind(con.dbh.raw_debater_results),
                create: con.dbh.raw_debater_results.create.bind(con.dbh.raw_debater_results),
                update: con.dbh.raw_debater_results.update.bind(con.dbh.raw_debater_results),
                delete: con.dbh.raw_debater_results.delete.bind(con.dbh.raw_debater_results),
                find: con.dbh.raw_debater_results.find.bind(con.dbh.raw_debater_results)
            }
        }
        this.institutions = {
            read: con.dbh.institutions.read.bind(con.dbh.institutions),
            create: con.dbh.institutions.create.bind(con.dbh.institutions),
            delete: con.dbh.institutions.delete.bind(con.dbh.institutions),
            find: con.dbh.institutions.find.bind(con.dbh.institutions),
            findOne: con.dbh.institutions.findOne.bind(con.dbh.institutions),
            update: con.dbh.institutions.update.bind(con.dbh.institutions)
        }
        this.close = con.dbh.close.bind(con.dbh)
    }
}

exports.CON = CON
