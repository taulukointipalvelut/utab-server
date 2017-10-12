module.exports = [
	{
		id: 1,
		name: "Academic",
		speaker_num_per_team: 4,
		team_num: 2,
		side_labels: {
			gov: "Affirmative",
			opp: "Negative"
		},
		side_labels_short: {
			gov: "Aff",
			opp: "Neg"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1},
			{order: 3, value: 1},
			{order: 4, value: 1}
		]
	},
	{
		id: 2,
		name: "North American",
		speaker_num_per_team: 2,
		team_num: 2,
		side_labels: {
			gov: "Government",
			opp: "Opposition"
		},
		side_labels_short: {
			gov: "Gov",
			opp: "Opp"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1},
			{order: 3, value: 0.5}
		]
	},
	{
		id: 3,
		name: "NAFA",
		speaker_num_per_team: 2,
		team_num: 2,
		side_labels: {
			gov: "Affirmative",
			opp: "Negative"
		},
		side_labels_short: {
			gov: "Aff",
			opp: "Opp"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1},
			{order: 3, value: 1},
			{order: 4, value: 1}
		]
	},
	{
		id: 4,
		name: "PDA3",
		speaker_num_per_team: 3,
		team_num: 2,
		side_labels: {
			gov: "Government",
			opp: "Opposition"
		},
		side_labels_short: {
			gov: "Gov",
			opp: "Opp"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1},
			{order: 3, value: 1}
		]
	},
	{
		id: 5,
		name: "PDA4",
		speaker_num_per_team: 4,
		team_num: 2,
		side_labels: {
			gov: "Government",
			opp: "Opposition"
		},
		side_labels_short: {
			gov: "Gov",
			opp: "Opp"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 0.5},
			{order: 3, value: 0.5},
			{order: 4, value: 1}
		]
	},
	{
		id: 6,
		name: "Asian",
		speaker_num_per_team: 3,
		team_num: 2,
		side_labels: {
			gov: "Government",
			opp: "Opponents"
		},
		side_labels_short: {
			gov: "Gov",
			opp: "Opp"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1},
			{order: 3, value: 1},
			{order: 4, value: 0.5}
		]
	},/*
	{
		id: 7,
		name: "British Parliamentary",
		speaker_num_per_team: 2,
		team_num: 4,
		side_labels: ["Opening Government", "Opening Opposition", "Closing Government", "Closing Opposition"],
		side_labels_short: ["OG", "OO", "CG", "CO"],
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1}
		]
	},*/
	{
		id: 8,
		name: "Public Forum",
		speaker_num_per_team: 2,
		team_num: 2,
		side_labels: {
			gov: "Affirmative",
			opp: "Negative"
		},
		side_labels_short: {
			gov: "Aff",
			opp: "Neg"
		},
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1},
			{order: 3, value: 1},
			{order: 4, value: 1}
		]
	}
]
