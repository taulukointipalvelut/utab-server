module.exports = [
	{
		id: 1,
		name: "Academic",
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
		],
        speaker_sequence: [
          { order: 1, value: 'gov-1' },
          { order: 2, value: 'opp-1' },
          { order: 3, value: 'gov-2' },
          { order: 4, value: 'opp-2' },
          { order: 5, value: 'gov-3' },
          { order: 6, value: 'opp-3' },
          { order: 7, value: 'opp-4' },
          { order: 8, value: 'gov-4' }
        ],
        roles: {
            gov: [
              { order: 1, long: 'Constructive', abbr: 'Const', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Attack', abbr: 'Attack', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Defense', abbr: 'Defense', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 4, long: 'Summary', abbr: 'Summary', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ],
            opp: [
              { order: 1, long: 'Constructive', abbr: 'Const', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Attack', abbr: 'Attack', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Defense', abbr: 'Defense', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 4, long: 'Summary', abbr: 'Summary', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ]
        }
	},
	{
		id: 2,
		name: "North American",
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
		],
        speaker_sequence: [
          { order: 1, value: 'gov-1' },
          { order: 2, value: 'opp-1' },
          { order: 3, value: 'gov-2' },
          { order: 4, value: 'opp-2' },
          { order: 5, value: 'opp-3' },
          { order: 6, value: 'gov-3' },
        ],
        roles: {
            gov: [
              { order: 1, long: 'Prime Minister', abbr: 'PM', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Government', abbr: 'MG', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Government Reply', abbr: 'GR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ],
            opp: [
              { order: 1, long: 'Leader of Opposition', abbr: 'LO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Opposition', abbr: 'MO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Opposition Reply', abbr: 'OR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ]
        }
	},/*
	{
		id: 3,
		name: "NAFA",
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
	},*/
	{
		id: 4,
		name: "PDA3",
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
		],
        speaker_sequence: [
          { order: 1, value: 'gov-1' },
          { order: 2, value: 'opp-1' },
          { order: 3, value: 'gov-2' },
          { order: 4, value: 'opp-2' },
          { order: 5, value: 'opp-3' },
          { order: 6, value: 'gov-3' }
        ],
        roles: {
            gov: [
              { order: 1, long: 'Prime Minister', abbr: 'PM', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Government', abbr: 'MG', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Government Reply', abbr: 'GR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ],
            opp: [
              { order: 1, long: 'Leader of Opposition', abbr: 'LO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Opposition', abbr: 'MO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Opposition Reply', abbr: 'OR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ]
        }
	},
	{
		id: 5,
		name: "PDA4",
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
		],
        speaker_sequence: [
          { order: 1, value: 'gov-1' },
          { order: 2, value: 'opp-1' },
          { order: 3, value: 'gov-2' },
          { order: 4, value: 'gov-3' },
          { order: 5, value: 'opp-2' },
          { order: 6, value: 'opp-3' },
          { order: 7, value: 'opp-4' },
          { order: 8, value: 'gov-4' }
        ],
        roles: {
            gov: [
              { order: 1, long: 'Prime Minister', abbr: 'PM', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Government1', abbr: 'MG1', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Member of Government2', abbr: 'MG2', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 4, long: 'Government Reply', abbr: 'GR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ],
            opp: [
              { order: 1, long: 'Leader of Opposition', abbr: 'LO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Opposition1', abbr: 'MO1', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Member of Opposition2', abbr: 'MO2', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 4, long: 'Opposition Reply', abbr: 'OR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ]
        }
	},
	{
		id: 6,
		name: "Asian",
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
		],
        speaker_sequence: [
          { order: 1, value: 'gov-1' },
          { order: 2, value: 'opp-1' },
          { order: 3, value: 'gov-2' },
          { order: 4, value: 'opp-2' },
          { order: 5, value: 'gov-3' },
          { order: 6, value: 'opp-3' },
          { order: 7, value: 'opp-4' },
          { order: 8, value: 'gov-4' }
        ],
        roles: {
            gov: [
              { order: 1, long: 'Prime Minister', abbr: 'PM', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Government', abbr: 'MG', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Whip', abbr: 'Whip', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 4, long: 'Government Reply', abbr: 'GR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ],
            opp: [
              { order: 1, long: 'Leader of Opposition', abbr: 'LO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 2, long: 'Member of Opposition', abbr: 'MO', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 3, long: 'Whip', abbr: 'Whip', range: { from: 1, to: 10, unit: 1, default: 5 } },
              { order: 4, long: 'Opposition Reply', abbr: 'OR', range: { from: 1, to: 10, unit: 1, default: 5 } }
            ]
        }
	},/*
	{
		id: 7,
		name: "British Parliamentary",
		team_num: 4,
		side_labels: ["Opening Government", "Opening Opposition", "Closing Government", "Closing Opposition"],
		side_labels_short: ["OG", "OO", "CG", "CO"],
		score_weights: [
			{order: 1, value: 1},
			{order: 2, value: 1}
		]
	},*/
	/*{
		id: 8,
		name: "Public Forum",
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
	}*/
]
