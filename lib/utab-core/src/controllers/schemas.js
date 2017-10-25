"use strict";

var mongoose = require('mongoose')
var assert = require('assert')
var ObjectId = mongoose.Types.ObjectId

var ConfigSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    current_round_num: {type: Number, default: 1},
    total_round_num: {type: Number, default: 4},
    db_url: {type: String, required: true},
    name: {type: String, required: true},
    style: {
		id: {type: Number, required: true},
		name: {type: String, default: "North American"},
		team_num: {type: Number, default: 2},
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
        roles: {type: mongoose.Schema.Types.Mixed, default: {}}
    },
    preev_weights: {type: [Number], default: [0, 0, 0, 0, 0, 0]},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

var RoundSchema = new mongoose.Schema({
    r: {type: Number, required: true, unique: true},
    name: {type: String, default: ""},
    team_allocation_opened: {type: Boolean, default: true},
    round_opened: {type: Boolean, default: true},
    adjudicator_allocation_opened: {type: Boolean, default: true},
    evaluator_in_team: {type: String, default: 'team'},
    evaluate_each_other: {type: Boolean, default: true},
    motions: {type: [String], default: ["THW test utab"]},
    /*weights_of_adjudicators: {
        chair: {type: Number, default: 1},
        panel: {type: Number, default: 1},
        trainee: {type: Number, default: 0}
    },*/
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

let SquareSchema = new mongoose.Schema({
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
    r: {type: Number, required: true, unique: true},
    allocation: [SquareSchema]
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

/*

Entitites

 */

var AdjudicatorSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
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

var TeamSchema = new mongoose.Schema({//TESTED//
    id: {type: Number, required: true, unique: true},
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

var VenueSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
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

var SpeakerSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

var InstitutionSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

/*

Results

 */

var RawSpeakerResultSchema = new mongoose.Schema({
    id: {type: Number, required: true, index: true},//target to evaluate
    from_id: {type: Number, required: true, index: true},//sender
    r: {type: Number, required: true, index: true},
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
RawSpeakerResultSchema.index({id: 1, from_id: 1, r: 1}, {unique: true})

var RawTeamResultSchema = new mongoose.Schema({
    id: {type: Number, required: true, index: true},
    from_id: {type: Number, required: true, index: true},
    r: {type: Number, required: true, index: true},
    weight: {type: Number, default: 1},
    win: {type: Number, required: true},
    opponents: {type: [Number], required: true},
    side: {type: String, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})
RawTeamResultSchema.index({id: 1, from_id: 1, r: 1}, {unique: true})

var RawAdjudicatorResultSchema = new mongoose.Schema({
    id: {type: Number, required: true, index: true},
    from_id: {type: Number, required: true, index: true},
    r: {type: Number, required: true, index: true},
    weight: {type: Number, default: 1},
    score: {type: Number, required: true},
    judged_teams: {type: [Number], required: true},
    comment: {type: String, default: ""},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})
RawAdjudicatorResultSchema.index({id: 1, from_id: 1, r: 1}, {unique: true})

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
