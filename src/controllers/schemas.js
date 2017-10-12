var mongoose = require('mongoose')

var TournamentSchema = new mongoose.Schema({
	id: {type: Number, required: true, unique: true}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
	versionKey: 'version'
})

var UserSchema = new mongoose.Schema({
	id: {type: String, required: true},
	password: {type: String, required: true}
})

var StylesSchema = new mongoose.Schema({
	id: {type: String, required: true, unique: true},
	name: {type: String, required: true},
	team_num: {type: Number, required: true},
	score_weights: {type: mongoose.Schema.Types.Mixed, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
	versionKey: 'version'
})

exports.UserSchema = UserSchema
exports.TournamentSchema = TournamentSchema
exports.StylesSchema = StylesSchema
