"use strict";

var mongoose = require('mongoose')
var schemas = require('./schemas.js')
var _ = require('underscore/underscore.js')

mongoose.Promise = global.Promise

function arrange_doc(doc) {
    var new_doc = JSON.parse(JSON.stringify(doc))
    delete new_doc.__v
    delete new_doc._id
    return new_doc
}

class DBTournamentsHandler {//TESTED//
    constructor({db_url: db_url}) {
        var conn = mongoose.createConnection(db_url)
        this.conn = conn
        conn.on('error', function (e) {
            console.log('connection failed: '+e)
        })

        var Tournament = conn.model('RoundInfo', schemas.TournamentSchema)

        this.tournaments = new TournamentsCollectionHandler(Tournament)

    }
    close() {
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
        return this.Model.find().exec().then(docs => docs.map(arrange_doc))
    }
    find(dict) {//TESTED//
        return this.Model.find(dict).exec().then(docs => docs.map(arrange_doc))
    }
    create(dict) {//TESTED//
        var M = this.Model

        var model = new M(dict)
        return model.save().then(arrange_doc)
    }
    update(dict) {//TESTED//
        var M = this.Model
        var identity = get_identity(this.identifiers, dict)

        return M.findOneAndUpdate(identity, {$set: dict}, {new: true}).exec().then(function(doc) {
            if (doc === null) {
                throw new errors.DoesNotExist(identity)
            } else {
                return arrange_doc(doc)
            }
        })
    }
    delete(dict) {//TESTED//
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
    findOne(dict) {
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
    }
}
class TournamentsCollectionHandler extends _CollectionHandler {
    constructor(Model) {
        super(Model, ['id'])
    }
}

exports.DBTournamentsHandler = DBTournamentsHandler

//var dt = new DBTournamentsHandler()
//dt.create({id: 3, name: "hi"}).then(dt.read().then(console.log)).catch(console.error)
