"use strict";

var mongoose = require('mongoose')
var assert = require('assert')
var ObjectId = mongoose.Types.ObjectId

var ConfigSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    style: {
		    id: {type: Number, required: true},
    		name: {type: String, default: "North American"},
    		score_weights: [{
              order: {type: Number, required: true},
              value: {type: Number, required: true},
        }],
        speaker_sequence: [{
            order: {type: Number, required: true},
            value: {type: String, required: true},
        }],
        side_labels: {
            gov: {type: String, default: 'Government'},
            opp: {type: String, default: 'Opposition'}
        },
        side_labels_short: {
            gov: {type: String, default: 'Gov'},
            opp: {type: String, default: 'Opp'}
        },
        roles: {
            gov: {type: mongoose.Schema.Types.Mixed, default: []},
            opp: {type: mongoose.Schema.Types.Mixed, default: []}
        },
        range: [{
            order: {type: Number, required: true},
            value: {type: mongoose.Schema.Types.Mixed, required: true},
        }],
        adjudicator_range: {
            from: {type: Number, required: true},
            to: {type: Number, required: true},
            default: {type: Number, required: true},
            unit: {type: Number, required: true}
        }
    },
    auth: {
        speaker: {
            required: {type: Boolean, default: false},
            key: {type: String}
        },
        adjudicator: {
            required: {type: Boolean, default: false},
            key: {type: String}
        },
        audience: {
            required: {type: Boolean, default: false},
            key: {type: String}
        }
    },
    preev_weights: {type: [Number], default: Array(100).fill(0)},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

var RoundSchema = new mongoose.Schema({
    r: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    name: {type: String, default: ""},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

RoundSchema.index({ r: 1, tournament_id: 1 }, { unique: true })

let SquareSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    venue: {type: mongoose.Schema.Types.Mixed, default: null},
    teams: {
        gov: {type: Number, required: true},
        opp: {type: Number, required: true}
    },
    chairs: {type: [Number], default: []},
    panels: {type: [Number], default: []},
    trainees: {type: [Number], default: []}
})

var DrawSchema = new mongoose.Schema({
    r: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    allocation: [SquareSchema],
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

DrawSchema.index({ r: 1, tournament_id: 1 }, { unique: true })
/*

Entitites

 */

var AdjudicatorSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    preev: {type: Number, default: 0},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}},
    details: [
        {
            r: {type: Number, required: true},
            available: {type: Boolean, default: true},
            institutions: {type: [Number], default: []},
            conflicts: {type: [Number], default: []}
        }
    ]
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

AdjudicatorSchema.index({ id: 1, tournament_id: 1 }, { unique: true })

var TeamSchema = new mongoose.Schema({//TESTED//
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}},
    details: [
        {
            r: {type: Number, required: true},
            available: {type: Boolean, default: true},
            institutions: {type: [Number], default: []},
            speakers: {type: [Number], default: []}
        }
    ]
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

TeamSchema.index({ id: 1, tournament_id: 1 }, { unique: true })

var VenueSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}},
    details: [
        {
            r: {type: Number, required: true},
            priority: {type: Number, default: 1},
            available: {type: Boolean, default: true}
        }
    ]
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

VenueSchema.index({ id: 1, tournament_id: 1 }, { unique: true })

var SpeakerSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

SpeakerSchema.index({ id: 1, tournament_id: 1 }, { unique: true })

var InstitutionSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

InstitutionSchema.index({ id: 1, tournament_id: 1 }, { unique: true })

/*

Results

 */

var RawSpeakerResultSchema = new mongoose.Schema({
    id: {type: Number, required: true},//target to evaluate
    tournament_id: {type: Number, required: true},
    from_id: {type: Number, required: true},//sender
    r: {type: Number, required: true},
    weight: {type: Number, default: 1},
    scores: [{
        order: {type: Number, required: true},
        value: {type: Number, required: true}
    }],
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

RawSpeakerResultSchema.index({id: 1, tournament_id: 1, from_id: 1, r: 1}, {unique: true})

var RawTeamResultSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    from_id: {type: Number, required: true},
    r: {type: Number, required: true},
    weight: {type: Number, default: 1},
    win: {type: Number, required: true},
    opponents: {type: [Number], required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})
RawTeamResultSchema.index({id: 1, tournament_id: 1, from_id: 1, r: 1}, {unique: true})

var RawAdjudicatorResultSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    tournament_id: {type: Number, required: true},
    from_id: {type: Number, required: true},
    r: {type: Number, required: true},
    weight: {type: Number, default: 1},
    score: {type: Number, required: true},
    comment: {type: String, default: ""},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})
RawAdjudicatorResultSchema.index({id: 1, tournament_id: 1, from_id: 1, r: 1}, {unique: true})

exports.RoundSchema = RoundSchema
exports.ConfigSchema = ConfigSchema
exports.DrawSchema = DrawSchema
exports.AdjudicatorSchema = AdjudicatorSchema
exports.TeamSchema = TeamSchema
exports.VenueSchema = VenueSchema
exports.SpeakerSchema = SpeakerSchema
exports.InstitutionSchema = InstitutionSchema
exports.RawSpeakerResultSchema = RawSpeakerResultSchema
exports.RawTeamResultSchema = RawTeamResultSchema
exports.RawAdjudicatorResultSchema = RawAdjudicatorResultSchema
