FORMAT: 1A

## Data Structures

### CreateTournament
+ id: 32141324123 (number)
+ name: testtournament (string, required)
+ style: {name: "NA", team_num: 2, score_weights: [1, 1, 0.5]} (object, optional)
    + default: {name: "NA", team_num: 2, score_weights: [1, 1, 0.5]}
+ total_round_num: 4 (number, optional)
    + default: 4
+ current_round_num: 1 (number, optional)
    + default: 1
+ user_defined_data: {} (object, optional)
    + default: {}

### Tournament
+ id: 32141324123 (number)
+ name: testtournament (string)
+ style: {name: "NA", team_num: 2, score_weights: [1, 1, 0.5]} (object)
+ total_round_num: 4 (number)
+ current_round_num: 1 (number)
+ user_defined_data: {} (object)

### ModifyTournament
+ id: 32141324123 (number, required)
+ name: testtournament (string, optional)
+ style: {name: "NA", team_num: 2, score_weights: [1, 1, 0.5]} (object, optional)
+ total_round_num: 4 (number, optional)
+ current_round_num: 1 (number, optional)
+ user_defined_data: {} (object, optional)

### SpecifyTournament
+ id: 32141324123 (number, required)

### Round
+ r: 1 (number),
+ motions: [] (array[string])

### Style
+ id: STYLE (string)
+ name: new style (string)
+ team_num: 2 (number)
+ positions: Affirmative, Negative (array[string])
+ positions_short: Aff, Neg (array[string])
+ score_weights: [1, 1, 1, 1] (array[number])

### CreateTeam
+ id: 2332221 (number, required)
+ name: kymstr (string, required)
+ available: true (boolean, optional)
    + default: true
+ speakers_by_r: [{r: 1, speakers: [43234244, 439587243]}] (array[object], optional)
    + default: []
+ institutions: [123431244, 321413244] (array[number], optional)
    + default: []
+ user_defined_data: {} (object, optional)
    + default: {}

### Team
+ id: 1324908734 (number)
+ name: kymstr (string)
+ available: true (boolean)
+ speakers_by_r: [{r: 1, speakers: [43234244, 439587243]}] (array[object])
+ institutions: [123431244, 321413244] (array[number])
+ user_defined_data: {} (object)

### ModifyTeam
+ id: 1324908734 (number, required)
+ name: kymstr (string, optional)
+ available: true (boolean, optional)
+ speakers_by_r: [{r: 1, speakers: [43234244, 439587243]}] (array[object], optional)
+ institutions: [123431244, 321413244] (array[number], optional)
+ user_defined_data: {} (object, optional)

### SpecifyTeam
+ id: 1324908734 (number, required)

### Adjudicator
+ id: 1324908734 (number)
+ name: kymstr (string)
+ available: true (boolean)
+ preev: 7 (number)
+ conflicts: [324907134, 321432144] (array[number])
+ institutions: [123431244, 321413244] (array[number])
+ user_defined_data: {} (object)

### Venue
+ id: 1324908734 (number)
+ name: kymstr (string)
+ available: true (boolean)
+ user_defined_data: {} (object)

### Institution
+ id: 1324908734 (number)
+ name: kymstr (string)
+ user_defined_data: {} (object)

### Speaker
+ id: 1324908734 (number)
+ name: kymstr (string)
+ user_defined_data: {} (object)

### SquareWarning
+ msg: InstitutionConflict (string)

### Square
+ id: 3
+ teams: [1, 2] (array[number])
+ chairs: [1] (array[number])
+ panels: [4, 6] (array[number])
+ trainees: [] (array[number])
+ venue: null (number)
+ warnings: [] (array[SquareWarning])

### RawTeamResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ from_id: 232342346 (number)
+ weight: 1 (number)
+ win: 1 (number)
+ side: gov (string)
+ opponents: [4352432524] (array[number])
+ user_defined_data: {} (object)

### RawSpeakerResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ from_id: 232342346 (number)
+ weight: 1 (number)
+ scores: [75, 0, 38.5] (array[number])
+ user_defined_data: {} (object)

### RawAdjudicatorResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ from_id: 232342346 (number)
+ weight: 1 (number)
+ score: 7 (number)
+ judged_teams: [32423423, 42512132] (array[number])
+ comment: Good adjudicator (string)
+ user_defined_data: {} (object)

### SummarizedTeamResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ win: 1 (number)
+ side: gov (string)
+ opponents: [4352432524] (array[number])
+ sum: 230 (number)
+ margin: -6 (number)
+ user_defined_data_collection: {} (object)

### SummarizedSimpleTeamResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ win: 1 (number)
+ side: gov (string)
+ opponents: [4352432524] (array[number])
+ user_defined_data_collection: {} (object)

### SummarizedSpeakerResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ scores: [76.33333, 0, 37.5] (array[number])
+ average: 75.888889
+ sum: 113.833333
+ user_defined_data_collection: [] (array[object])

### SummarizedAdjudicatorResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ score: 7 (number)
+ judged_teams: [32423423, 42512132] (array[number])
+ comments: [Good adjudicator, not too bad] (array[string])
+ user_defined_data_collection: [] (array[object])

### CompiledSpeakerResult
+ id: 3432522346 (number)
+ average: 75.888889
+ sum: 113.833333
+ sd: 12.53 (number)
+ details: [] (array[SummarizedSpeakerResult])

### CompiledTeamResult
+ id: 3432522346 (number)
+ win: 2 (number)
+ sum: 440 (number)
+ average: 110 (number)
+ sd: 12.53 (number)
+ margin: 16 (number)
+ average_margin: -3 (number)
+ opponent_average: 108
+ vote: 3 (number)
+ vote_rate: 0.75 (number)
+ past_sides: gov (string)
+ past_opponents: [4352432524, 4352432524, 823974324] (array[number])
+ details: [] (array[SummarizedTeamResult])

### CompiledAdjudicatorResult
+ id: 3432522346 (number)
+ average: 7.2222
+ sd: 1.89
+ judged_teams: [32423423, 42512132, 42512132, 32423222] (array[number])
+ active_num: 7 (number)
+ details: [] (array[SummarizedAdjudicatorResult])

### AllocationOptions
+ by: [1] (array[number], required)
+ simple: false (boolean, optional)
    + default: false
+ force: false (boolean, optional)
    + default: false
+ team_allocation_algorithm: standard (string, optional)
    + default: 'standard'
+ team_allocation_algorithm_options: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution'], 'method': 'straight'} (object, optional)
    + default: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution'], "method": "straight"}
+ adjudicator_allocation_algorithm: standard (string, optional)
    + default: 'standard'
+ adjudicator_allocation_algorithm_options: {"filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],"assign": 'high_to_high',"scatter": false} (object, optional)
    + default: {"filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],"assign": 'high_to_high',"scatter": false}
+ venue_allocation_algorithm_options: {shuffle: true} (object, optional)
    + default: {shuffle: true}
+ numbers_of_adjudicators: {"chairs": 2,"panels": 1,"trainees": 1} (object, optional)
    + default: {"chairs": 2,"panels": 1,"trainees": 1}

### TeamAllocationOptions
+ by: [1] (array[number], required)
+ simple: false (boolean, optional)
   + default: false
+ force: false (boolean, optional)
   + default: false
+ algorithm: standard (string, optional)
   + default: 'standard'
+ algorithm_options: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution'], "method": "straight"} (object, optional)
   + default: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution'], "method": "straight"}

### AdjudicatorAllocationOptions
+ by: [1] (array[number], required)
+ simple: false (boolean, optional)
   + default: false
+ force: false (boolean, optional)
   + default: false
+ algorithm: standard (string, optional)
   + default: 'standard'
+ algorithm_options: {"filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],"assign": 'high_to_high',"scatter": false} (object, optional)
   + default: {"filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],"assign": 'high_to_high',"scatter": false}
+ numbers_of_adjudicators: {"chairs": 2,"panels": 1,"trainees": 1} (object, optional)
   + default: {"chairs": 2,"panels": 1,"trainees": 1}

### VenueAllocationOptions
+ by: [1] (array[number], required)
+ force: false (boolean, optional)
    + default: false
+ shuffle: true (boolean, optional)
    + default: true

# UTab Operation API

# Group Styles

## styles [/styles]

### search or read all styles [GET]

+ Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Style])
        + log (array[object])

### create a style [POST]

### update a style [PUT]

### delete a style [DELETE]

# Group Tournaments

## tournaments [/tournaments]

### search or read all tournaments [GET]

+ Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Tournament])

### create a tournament [POST]

+ Request (application/json)
    + Attributes (CreateTournament)

+ Response 200 (application/json)
    + errors (array[object])
    + Attributes
        + errors (array[object])
        + data (array[Tournament])
        + log (array[object])

### delete a tournament [DELETE]

+ Request (application/json)
    + Attributes (SpecifyTournament)

+ Response 200 (application/json)
    + errors (array[object])
    + Attributes
        + errors (array[object])
        + data (array[Tournament])
        + log (array[object])

# Group Config

## config [/tournaments/{tournament_id}]

### show config [GET]
 + Parameters
    + tournament_id: 323242342432 (number)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Tournament)
        + log (array[object])

### update config [PUT]
 + Parameters
    + tournament_id: 323242342432 (number)

updates config.
 + Request (application/json)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Tournament)
        + log (array[object])

# Group Rounds

## rounds [/tournaments/{tournament_id}/rounds]

### search or read round info [GET]
 + Parameters
    + tournament_id: 323242342432 (number)
    + r: 1 (number)

### create round info [POST]

### update round info [PUT]

### delete round info [DELETE]

## specific round [/tournaments/{tournament_id}/rounds/{r}]

### read round info [GET]

### update round info [PUT]

### delete round info [DELETE]

# Group Entities

* each resouce url accepts object or array[object]
* also each resource url has sub url of the individual entities where you don't have to request entity id for GET/PUT/DELETE methods though POST method is not available in the sub url.

## teams [/tournaments/{tournament_id}/teams{?id,name,available,institutions}]

### search or read all teams [GET]

 * read all teams or search teams on specified condition at query
 * NO SIDE EFFECT

 + Parameters
    + tournament_id: 323242342432 (number)
    + name: teamA (string)
    + available: true (boolean)
    + institutions: [43242342, 542343523] (array[number])

 + Response 200 (application/json)

### create a team [POST]

 * create a team
 * if force option is true, creates a team even if the same name team already exists, otherwise throws an error.

 + Parameters
     + tournament_id: 323242342432 (number)

 + Request Team (application/json)

    + Attributes (CreateTeam)

 + Request Teams (applications/json)
    + Attributes (array[CreateTeam])

 + Response 200 (application/json)
    same as requested data

### update a team [PUT]

 * updates a team.

 ::: warning
 throws an error if the specified team does not exist.
 :::
 + Parameters
     + tournament_id: 323242342432 (number)

+ Request (application/json)
    + Attributes (ModifyTeam)

+ Response (application/json)
    + Attributes
        + errors (array[object])
        + data (Team)
        + log (array[object])

### delete a team [DELETE]

* deletes a team.
::: warning
throws an error if the specified team does not exist.
:::
+ Parameters
    + tournament_id: 323242342432 (number)

+ Request (application/json)
    + Attributes (SpecifyTeam)

+ Response (application/json)
    + Attributes
        + errors (array[object])
        + data (Team)
        + log (array[object])

## specific team [/tournaments/{tournament_id}/teams/{team_id}]

### get team information [GET]

 + Parameters
    + tournament_id: 3241087341 (number)
    + team_id: 23442305928 (number)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Team)
        + log (array[object])

### update a team [PUT]

 * updates a team.

 ::: warning
 throws an error if the specified team does not exist.
 :::
 + Parameters
     + tournament_id: 3241087341 (number)
     + team_id: 23442305928 (number)

### delete a team [DELETE]

* deletes a team.
::: warning
throws an error if the specified team does not exist.
:::
+ Parameters
    + tournament_id: 3241087341 (number)
    + team_id: 23442305928 (number)

## adjudicators [/tournaments/{tournament_id}/adjudicators]

* similar request/response with teams
+ Parameters
    + tournament_id: 3241087341 (number)

## specific adjudicator [/tournaments/{tournament_id}/adjudicator/{adjudicator_id}]

* similar request/response with specific team
+ Parameters
    + tournament_id: 3241087341 (number)
    + adjudicator_id: 32479169999 (number)

## venues [/tournaments/{tournament_id}/venues]

* similar request/response with teams
+ Parameters
    + tournament_id: 3241087341 (number)

## specific venue [/tournaments/{tournament_id}/venues/{venue_id}]

* similar request/response with specific team
+ Parameters
    + tournament_id: 3241087341 (number)
    + venue_id: 321948719034 (number)

## speakers [/tournaments/{tournament_id}/speakers]

* similar request/response with teams
+ Parameters
    + tournament_id: 3241087341 (number)

## specific speaker [/tournaments/{tournament_id}/speakers/{speaker_id}]

* similar request/response with specific team
+ Parameters
    + tournament_id: 3241087341 (number)
    + speaker_id: 4398201575 (number)

## institutions [/tournaments/{tournament_id}/institutions]

* similar request/response with teams
+ Parameters
    + tournament_id: 3241087341 (number)

## specific institution [/tournaments/{tournament_id}/institutions/{institution_id}]

* similar request/response with specific team
+ Parameters
    + tournament_id: 3241087341 (number)
    + institution_id: 3214879134 (number)

# Group Raw Results

## raw team results [/tournaments/{tournament_id}/teams/results/raw]

### get raw team result [GET]
+ Parameters
    + tournament_id: 3241087341 (number)

## raw team results [/tournaments/{tournament_id}/rounds/{r}/teams/results/raw]

### get raw team result [GET]
+ Parameters
    + r: 1 (number)
    + tournament_id: 3241087341 (number)

## raw adjudicator results [/tournaments/{tournament_id}/adjudicators/results/raw]

## raw adjudicator results [/tournaments/{tournament_id}/rounds/{r}/adjudicators/results/raw]

## raw speaker results [/tournaments/{tournament_id}/speakers/results/raw]

## raw speaker results [/tournaments/{tournament_id}/rounds/{r}/speakers/results/raw]

# Group Draws

## draws [/tournaments/{tournament_id}/draws]

### get draws [GET]
+ Parameters
    + tournament_id: 3241087341 (number)

+ Response
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

### save a draw [POST]

### update saved draw [PUT]

### delete saved draw [DELETE]

## draws [/tournaments/{tournament_id}/rounds/{r}/draws]

### get a draw [GET]
+ Parameters
    + r: 1 (number)
    + tournament_id: 3241087341 (number)

+ Response
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

### save an draw [POST]

### update saved draw [PUT]

### delete saved draw [DELETE]

# Group Allocations

## allocations [/tournaments/{tournament_id}/allocations]

### compute allocation [PATCH]
* computes an allocation for current round. Can be a shortcut for computing all team/adjudicator/venue allocation at once. You must specify the rounds of which results are used to compute allocations.

+ Parameters
    + tournament_id: 3241087341 (number)

+ Request (application/json)
   + Attributes
       + for (number)
       + options (AllocationOptions, optional)

+ Response 200 (application/json)
   + Attributes
       + errors (array[object])
       + data (array[Square])
       + log (array[object])

## allocations [/tournaments/{tournament_id}/rounds/{r}/allocations]

### compute allocation [PATCH]
* computes an allocation for current round. Can be a shortcut for computing all team/adjudicator/venue allocation at once.

+ Parameters
    + r: 1 (number)
    + tournament_id: 3241087341 (number)

+ Request (application/json)
   + Attributes
       + options (AllocationOptions, optional)

+ Response 200 (application/json)
   + Attributes
       + errors (array[object])
       + data (array[Square])
       + log (array[object])

## team allocations [/tournaments/{tournament_id}/allocations/teams]

## team allocations [/tournaments/{tournament_id}/rounds/{r}/allocations/teams]

### compute team allocation [PATCH]

 * if simple option is true, it doesn't use speaker scores in computing matchups.
 + Parameters
    + r: 1 (number)
    + tournament_id: 323242342432 (number)

+ Request (application/json)
    + Attributes
        + options (TeamAllocationOptions, optional)

+ Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

## adjudicator allocations [/tournaments/{tournament_id}/allocations/adjudicators]

## adjudicator allocations [/tournaments/{tournament_id}/rounds/{r}/allocations/adjudicators]

### compute adjudicator allocation [PATCH]

 * computes an adjudicator allocation based on given team allocation
 + Parameters
    + r: 1 (number)
    + tournament_id: 323242342432 (number)

+ Request (application/json)
    + Attributes
        + allocation (array[Square], required)
        + options (AdjudicatorAllocationOptions, optional)

+ Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

## venue allocations [/tournaments/{tournament_id}/rounds/{r}/allocations/venues]

### compute venue allocation [PATCH]

 * computes a venue allocation based on given team/adjudicator allocation
 * if force is true, it allocates venues even if venues are fewer than squares.
 * if shuffle is true, it shuffles venues so that no one can recognize current team rankings.
 + Parameters
    + r: 1 (number)
     + tournament_id: 323242342432 (number)

 + Request (application/json)
      + Attributes
        + allocation (array[Square], required)
        + options (VenueAllocationOptions, optional)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

# Group Result

## team results [/tournaments/{tournament_id}/teams/results]

### get compiled team result [PATCH]

 * returns compiled team results. if rounds is not specified, it compiles all raw results including those collected in the current round.

 + Parameters
    + tournament_id: 323242342432 (number)

 + Request (application/json)
    + Attributes
        + rs: [1, 2] (array[number])
        + options
            + force (boolean, optional)
                + default: false

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (CompiledTeamResult)
        + log (array[object])

## adjudicator results [/tournaments/{tournament_id}/adjudicators/results]

## speaker results [/tournaments/{tournament_id}/speakers/results]
