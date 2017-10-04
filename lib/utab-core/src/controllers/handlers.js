"use strict";

var mongoose = require('mongoose')
var schemas = require('./schemas.js')
var loggers = require('../general/loggers.js')
var errors = require('../general/errors.js')
var _ = require('underscore/underscore.js')

mongoose.Promise = global.Promise

function arrange_doc(doc) {
    var new_doc = JSON.parse(JSON.stringify(doc))
    delete new_doc._id
    if (new_doc.hasOwnProperty('details')) {
        new_doc.details.map(function(detail) { delete detail._id })
    }
    return new_doc
}

class DBHandler {//TESTED//
    constructor(db_url, options) {
        loggers.controllers('debug', 'constructor of DBHandler is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var conn = mongoose.createConnection(db_url)
        this.conn = conn
        this.conn.on('error', function (e) {
            loggers.controllers('error', 'failed to connect to the database @ DBHandler'+e)
        })
        this.conn.once('open', function() {
            loggers.controllers('connected to the database @ DBHandler of '+db_url)
        })

        var Config = conn.model(options.id.toString()+'_Config', schemas.ConfigSchema)
        var Round = conn.model(options.id.toString()+'_Round', schemas.RoundSchema)

        var Draw = conn.model(options.id.toString()+'_Draw', schemas.DrawSchema)

        var Team = conn.model(options.id.toString()+'_Team', schemas.TeamSchema)
        var Adjudicator = conn.model(options.id.toString()+'_Adjudicator', schemas.AdjudicatorSchema)
        var Venue = conn.model(options.id.toString()+'_Venue', schemas.VenueSchema)
        var Speaker = conn.model(options.id.toString()+'_Speaker', schemas.SpeakerSchema)
        var Institution = conn.model(options.id.toString()+'_Institution', schemas.InstitutionSchema)

        var RawTeamResult = conn.model(options.id.toString()+'_RawTeamResult', schemas.RawTeamResultSchema)
        var RawSpeakerResult = conn.model(options.id.toString()+'_RawSpeakerResult', schemas.RawSpeakerResultSchema)
        var RawAdjudicatorResult = conn.model(options.id.toString()+'_RawAdjudicatorResult', schemas.RawAdjudicatorResultSchema)

        this.config = new ConfigCollectionHandler(Config)
        this.rounds = new RoundsCollectionHandler(Round)

        this.draws = new DrawsCollectionHandler(Draw)

        this.teams = new EntityCollectionHandler(Team)
        this.adjudicators = new EntityCollectionHandler(Adjudicator)
        this.venues = new EntityCollectionHandler(Venue)
        this.speakers = new EntityCollectionHandler(Speaker)
        this.institutions = new EntityCollectionHandler(Institution)

        this.raw_team_results = new ResultsCollectionHandler(RawTeamResult)
        this.raw_speaker_results = new ResultsCollectionHandler(RawSpeakerResult)
        this.raw_adjudicator_results = new ResultsCollectionHandler(RawAdjudicatorResult)

        if (options) {
            let new_options = _.clone(options)
            new_options.db_url = db_url
            this.config.create(new_options).catch(function(err) {})
        }
    }
    close() {
        loggers.controllers('debug', 'connection by DBHandler was closed')
        this.conn.close()
    }
}

function get_identity(identifiers, dict) {
    var new_dict = {}
    for (var identifier of identifiers) {
        new_dict[identifier] = dict[identifier]
    }
    return new_dict
}

class _CollectionHandler {//TESTED// returns Promise object
    constructor(Model, identifiers) {
        this.Model = Model
        this.identifiers = identifiers
    }
    read() {//TESTED//
        loggers.controllers(this.Model.modelName+'.read is called')
        return this.Model.find().exec().then(docs => docs.map(arrange_doc))
    }
    find(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.find is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        return this.Model.find(dict).exec().then(docs => docs.map(arrange_doc))
    }
    create(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.create is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model

        var model = new M(dict)
        return model.save().then(arrange_doc)
    }
    update(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.update is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, dict)

        return M.findOneAndUpdate(identity, {$set: dict, $inc: {version: 1}}, {new: true}).exec().then(function(doc) {
            if (doc === null) {
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }
    delete(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.delete is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, dict)

        return M.findOneAndRemove(identity).exec().then(function(doc) {
            if (doc === null) {
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }
    deleteAll() {//TESTED//
        loggers.controllers(this.Model.modelName+'.deleteAll is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model

        return M.remove({}).exec().then(function(doc) {
            return arrange_doc(doc)
        })
    }
    findOne(dict) {
        loggers.controllers(this.Model.modelName+'.findOne is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, dict)

        return M.findOne(identity).exec().then(function(doc) {
            if (doc === null) {
                loggers.controllers('error', 'DoesNotExist'+JSON.stringify(dict))
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }/*
    exists(dict) {
        loggers.controllers(this.Model.modelName+'.exists is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, dict)

        return M.findOne(identity).exec().then(function (doc) {
            if (doc !== null) {
                return true
            } else {
                return false
            }
        })
    }*/
}

class EntityCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['id'])
    }
    create(dict) {
        loggers.controllers(this.Model.modelName+'.create is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model

        return M.findOne({id: dict.id}).exec().then(function(doc) {
            if (doc !== null) {
                loggers.controllers('error', 'AlreadyExists'+JSON.stringify({id: dict.id}))
                throw new errors.AlreadyExists({id: dict.id})
            } else {
                var model = new M(dict)
                return model.save().then(arrange_doc)
            }
        })
    }
}

class ResultsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['id', 'r', 'from_id'])
    }
}

class DrawsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['r'])
    }
}

class RoundsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['r'])
    }
}

class ConfigCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['db_url'])
        this.findOne = undefined
        this.delete = undefined
        this.find = undefined
    }
    read() {//TESTED//
        loggers.controllers(this.Model.modelName+'.read is called')
        var that = this
        return super.read.call(that).then(function(docs) {
            if (docs.length === 0) {
                return {}
            } else {
                return docs[0]
            }
        })
    }
    create(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.create is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var that = this
        return super.create.call(that, dict)
    }
    update(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.update is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var super_update = super.update
        var that = this
        return this.read().then(function(doc) {
            var new_dict = _.clone(dict)
            new_dict.id = doc.id
            return super_update.call(that, new_dict)
        })
    }

}

exports.DBHandler = DBHandler

//var dt = new DBTournamentsHandler()
//dt.create({id: 3, name: "hi"}).then(dt.read().then(console.log)).catch(console.error)
