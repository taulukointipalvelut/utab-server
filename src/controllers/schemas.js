var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true, minlength: 6},
	password: {type: String, required: true, minlength: 8},
	tournaments: [{type: Number}],
	usertype: {type: String, required: true}//'user', 'superuser'
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
	versionKey: 'version'
})

var StylesSchema = new mongoose.Schema({
	id: {type: Number, required: true, unique: true},
	name: {type: String, required: true},
	//team_num: {type: Number, required: true},
	score_weights: {type: mongoose.Schema.Types.Mixed, required: true},
	side_labels: {type: mongoose.Schema.Types.Mixed, default: { gov: "Government", opp: "Opposition" }},
	side_labels_short: {type: mongoose.Schema.Types.Mixed, default: { gov: "Gov", opp: "Opp" }},
	speaker_sequence: {type: mongoose.Schema.Types.Mixed, required: true},
	range: [
		{
			order: { type: Number, required: true },
			value: {
				from: { type: Number, require: true },
				to: { type: Number, required: true },
				unit: { type: Number, required: true },
				default: { type: Number, required: true }
			}
	 	}
	],
	roles: {type: mongoose.Schema.Types.Mixed, required: true},
    user_defined_data: {type: mongoose.Schema.Types.Mixed, default: {}}
},{
    timestamps: {createdAt: 'created', updatedAt: 'updated'},
	versionKey: 'version'
})

exports.UserSchema = UserSchema
exports.StylesSchema = StylesSchema
