var mongoose = require('mongoose')

var TournamentSchema = new mongoose.Schema({
    db_url: {type: String, require: true, unique: true},
    name: {type: String, default: 'tournament_'+Date.now().toString()},
    total_round_num: {type: Number, default: 4},
    current_round_num: {type: Number, default: 1},
    style: {type: String, default: 'NA'},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
})

exports.TournamentSchema = TournamentSchema
