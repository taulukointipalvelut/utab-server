var mongoose = require('mongoose')

var TournamentSchema = new mongoose.Schema({
	id: {type: Number, required: true, unique: true}
})

var StylesSchema = new mongoose.Schema({
	id: {type: String, required: true, unique: true},
	name: {type: String, required: true},
	team_num: {type: Number, required: true},
	positions: {type: [String], required: true},
	positions_short: {type: [String], required: true},
	score_weights: {type: [Number], required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
})


exports.TournamentSchema = TournamentSchema
exports.StylesSchema = StylesSchema
