"use strict";

var mongoose = require('mongoose')
var assert = require('assert')
var ObjectId = mongoose.Types.ObjectId

var ConfigSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    db_url: {type: String, required: true},
    name: {type: String, required: true},
    style: {
		id: {type: String, default: "NA"},
		name: {type: String, default: "North American"},
		//debater_num_per_team: {type: Number, default: 2},
		team_num: {type: Number, default: 2},
		positions: {type: [String], default: ["Government", "Opposition"]},
		positions_short: {type: [String], default: ["Gov", "Opp"]},
		score_weights: {type: [Number], default: [1, 1, 0.5]}//,
		//replies: {type: [Number], default: [1]},
		//reply_num: {type: [Number], default: 1}
    },
    preev_weights: {type: [Number], default: [0, 0, 0, 0, 0, 0]},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

var RoundSchema = new mongoose.Schema({
    r: {type: Number, required: true, unique: true},
    motions: {type: [String], default: ["THW test utab"]},
    weights_of_adjudicators: {
        chair: {type: Number, default: 1},
        panel: {type: Number, default: 1},
        trainee: {type: Number, default: 0}
    },
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

var DrawSchema = new mongoose.Schema({
    r: {type: Number, required: true, unique: true},
    allocation: {type: mongoose.Schema.Types.Mixed, required: true}
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
            debaters: {type: [Number], default: []}
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
            available: {type: Number, default: true}
        }
    ]
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})

var DebaterSchema = new mongoose.Schema({
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

var RawDebaterResultSchema = new mongoose.Schema({
    id: {type: Number, required: true, index: true},//target to evaluate
    from_id: {type: Number, required: true, index: true},//sender
    r: {type: Number, required: true, index: true},
    weight: {type: Number, default: 1},
    scores: {type: [Number], required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
    versionKey: 'version'
})
RawDebaterResultSchema.index({id: 1, from_id: 1, r: 1}, {unique: true})

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
exports.DebaterSchema = DebaterSchema
exports.InstitutionSchema = InstitutionSchema
exports.RawDebaterResultSchema = RawDebaterResultSchema
exports.RawTeamResultSchema = RawTeamResultSchema
exports.RawAdjudicatorResultSchema = RawAdjudicatorResultSchema
