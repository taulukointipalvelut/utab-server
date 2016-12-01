var mongoose = require('mongoose')

var TournamentSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true},
    db_url: {type: String, require: true, unique: true},
    name: {type: String, require: true, unique: true},
    total_round_num: {type: Number, default: 4},
    current_round_num: {type: Number, default: 1},
    style: {type: String, default: 'NA'},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
})

exports.TournamentSchema = TournamentSchema
