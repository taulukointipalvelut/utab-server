"use strict";

var mongoose = require('mongoose')
var schemas = require('./controllers/schemas.js')
var loggers = require('./general/loggers.js')
var errors = require('./general/errors.js')
var md5 = require('blueimp-md5')

mongoose.Promise = global.Promise

function hash (val) {
    let date = Date.now()
    return parseInt(md5(val, date).slice(0, Number.MAX_SAFE_INTEGER.toString().length - 2), 16)
}

function arrange_doc(doc) {
    var new_doc = JSON.parse(JSON.stringify(doc))
    delete new_doc._id
    delete new_doc.tournament_id
    if (new_doc.hasOwnProperty('details')) {
        new_doc.details.map(function(detail) { delete detail._id })
    }
    return new_doc
}

function lighten_result(doc) {
    return {
        id: doc.id,
        from_id:doc.from_id,
        r: doc.r,
        version: doc.version,
        updated: doc.updated,
        created: doc.created
    }
}

class DBHandler {//TESTED//
    constructor(db_url) {
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

        var Config = conn.model('Config', schemas.ConfigSchema)
        var Round = conn.model('Round', schemas.RoundSchema)

        var Draw = conn.model('Draw', schemas.DrawSchema)

        var Team = conn.model('Team', schemas.TeamSchema)
        var Adjudicator = conn.model('Adjudicator', schemas.AdjudicatorSchema)
        var Venue = conn.model('Venue', schemas.VenueSchema)
        var Speaker = conn.model('Speaker', schemas.SpeakerSchema)
        var Institution = conn.model('Institution', schemas.InstitutionSchema)

        var RawTeamResult = conn.model('RawTeamResult', schemas.RawTeamResultSchema)
        var RawSpeakerResult = conn.model('RawSpeakerResult', schemas.RawSpeakerResultSchema)
        var RawAdjudicatorResult = conn.model('RawAdjudicatorResult', schemas.RawAdjudicatorResultSchema)

        this.configs = new ConfigCollectionHandler(Config)
        this.rounds = new RoundsCollectionHandler(Round)

        this.draws = new DrawsCollectionHandler(Draw)

        this.teams = new EntityCollectionHandler(Team)
        this.adjudicators = new EntityCollectionHandler(Adjudicator)
        this.venues = new EntityCollectionHandler(Venue)
        this.speakers = new EntityCollectionHandler(Speaker)
        this.institutions = new EntityCollectionHandler(Institution)

        this._raw_team_results = new ResultsCollectionHandler(RawTeamResult)
        this._raw_speaker_results = new ResultsCollectionHandler(RawSpeakerResult)
        this._raw_adjudicator_results = new ResultsCollectionHandler(RawAdjudicatorResult)
        this.teams.results = this._raw_team_results
        this.speakers.results = this._raw_speaker_results
        this.adjudicators.results = this._raw_adjudicator_results
    }
    destroy (tournament_id) {
        let targets = ['rounds', 'draws', 'teams', 'adjudicators', 'venues', 'speakers', 'institutions', '_raw_team_results', '_raw_adjudicator_results', '_raw_speaker_results']
        return Promise.all(targets.map(target => this[target].deleteAll(tournament_id)))
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
    read(tournament_id) {//TESTED//
        loggers.controllers(this.Model.modelName+'.read is called')
        return this.Model.find({ tournament_id }).exec().then(docs => docs.map(arrange_doc))
    }
    find(tournament_id, dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.find is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        return this.Model.find({ tournament_id, ...dict }).exec().then(docs => docs.map(arrange_doc))
    }
    create(tournament_id, dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.create is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model

        var model = new M({ tournament_id, ...dict})
        return model.save().then(arrange_doc)
    }
    update(tournament_id, dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.update is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, { tournament_id, ...dict })
        delete dict.tournament_id

        return M.findOneAndUpdate(identity, {$set: dict, $inc: {version: 1}}, {new: true}).exec().then(function(doc) {
            if (doc === null) {
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }
    delete(tournament_id, dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.delete is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, { tournament_id, ...dict })

        return M.findOneAndRemove(identity).exec().then(function(doc) {
            if (doc === null) {
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }
    deleteAll(tournament_id) {//TESTED//
        loggers.controllers(this.Model.modelName+'.deleteAll is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model

        return M.remove({ tournament_id }).exec().then(function(doc) {
            return arrange_doc(doc)
        })
    }
    findOne(tournament_id, dict) {
        loggers.controllers(this.Model.modelName+'.findOne is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model
        var identity = get_identity(this.identifiers, { tournament_id, ...dict })

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
        super(Model, ['tournament_id', 'id'])
    }
    create(tournament_id, dict, force) {
        loggers.controllers(this.Model.modelName+'.create is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var M = this.Model

        return M.findOne({ tournament_id, name: dict.name }).exec().then(function(doc) {
            if (doc !== null && !force) {
                loggers.controllers('error', 'AlreadyExists'+JSON.stringify({name: dict.name}))
                throw new errors.AlreadyExists({name: dict.name})
            } else {
                dict.id = hash(dict.name)
                var model = new M({ tournament_id, ...dict })
                return model.save().then(arrange_doc)
            }
        })
    }
}

class ResultsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['tournament_id', 'id', 'r', 'from_id'])
    }
    summarize(tournament_id) {//TESTED//
        loggers.controllers(this.Model.modelName+'.summarize is called')
        return this.Model.find({ tournament_id }).exec().then(docs => docs.map(arrange_doc).map(lighten_result))
    }
}

class DrawsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['tournament_id', 'r'])
    }
}

class RoundsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['tournament_id', 'r'])
    }
}

class ConfigCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['id'])
    }
    readOne(id) {//TESTED//
        loggers.controllers(this.Model.modelName+'.read is called')
        return this.Model.find({ id }).exec().then(docs => arrange_doc(docs[0]))
    }
    read() {
        return this.Model.find().exec().then(docs => docs.map(arrange_doc))
    }
    create(dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.create is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))

        var model = new this.Model(dict)
        return model.save().then(arrange_doc)
    }
    delete(id, dict) {//TESTED//
        loggers.controllers(this.Model.modelName+'.delete is called')
        loggers.controllers('debug', 'arguments are: '+JSON.stringify(arguments))
        var identity = get_identity(this.identifiers, { id, ...dict })

        return this.Model.findOneAndRemove(identity).exec().then(function(doc) {
            if (doc === null) {
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }
}

module.exports = DBHandler

//var dt = new DBTournamentsHandler()
//dt.create({id: 3, name: "hi"}).then(dt.read().then(console.log)).catch(console.error)
