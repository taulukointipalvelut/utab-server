FORMAT: 1A

## Data Structures

### CreateTournament
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

### Style
+ id: STYLE (string)
+ name: new style (string)
+ team_num: 2 (number)
+ positions: Affirmative, Negative (array[string])
+ positions_short: Aff, Neg (array[string])
+ score_weights: [1, 1, 1, 1] (array[number])

### CreateTeam
+ name: kymstr (string, required)
+ available: true (boolean, optional)
    + default: true
+ debaters_by_r: [{r: 1, debaters: [43234244, 439587243]}] (array[object], optional)
    + default: []
+ institutions: [123431244, 321413244] (array[number], optional)
    + default: []    
+ user_defined_data: {} (object, optional)
    + default: {}

### Team
+ id: 1324908734 (number)
+ name: kymstr (string)
+ available: true (boolean)
+ debaters_by_r: [{r: 1, debaters: [43234244, 439587243]}] (array[object])
+ institutions: [123431244, 321413244] (array[number])
+ user_defined_data: {} (object)

### ModifyTeam
+ id: 1324908734 (number, required)
+ name: kymstr (string, optional)
+ available: true (boolean, optional)
+ debaters_by_r: [{r: 1, debaters: [43234244, 439587243]}] (array[object], optional)
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

### Debater
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

### RawDebaterResult
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
+ user_defined_data: {} (object)

### SummarizedSimpleTeamResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ win: 1 (number)
+ side: gov (string)
+ opponents: [4352432524] (array[number])
+ user_defined_data: {} (object)

### SummarizedDebaterResult
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

### CompiledDebaterResult
+ id: 3432522346 (number)
+ average: 75.888889
+ sum: 113.833333
+ sd: 12.53 (number)
+ details: [] (array[SummarizedDebaterResult])

### CompiledTeamResult
+ id: 3432522346 (number)
+ win: 2 (number)
+ sum: 440 (number)
+ margin: 16 (number)
+ average: 110 (number)
+ sd: 12.53 (number)
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
+ simple: false (boolean, optional)
    + default: false
+ force: false (boolean, optional)
    + default: false
+ team_allocation_algorithm: standard (string, optional)
    + default: 'standard'
+ team_allocation_algorithm_options: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution']} (object, optional)
    + default: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution']}
+ adjudicator_allocation_algorithm: standard (string, optional)
    + default: 'standard'
+ adjudicator_allocation_algorithm_options: {"filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],"assign": 'high_to_high',"scatter": false} (object, optional)
    + default: {"filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],"assign": 'high_to_high',"scatter": false}
+ venue_allocation_algorithm_options: {shuffle: true} (object, optional)
    + default: {shuffle: true}
+ numbers_of_adjudicators: {"chairs": 2,"panels": 1,"trainees": 1} (object, optional)
    + default: {"chairs": 2,"panels": 1,"trainees": 1}

### TeamAllocationOptions
+ simple: false (boolean, optional)
   + default: false
+ force: false (boolean, optional)
   + default: false
+ algorithm: standard (string, optional)
   + default: 'standard'
+ algorithm_options: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution']} (object, optional)
   + default: {"filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution']}

### AdjudicatorAllocationOptions
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

# Group Rounds

## rounds [/tournaments/{tournament_id}]

### show status [GET]

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Tournament)
        + log (array[object])

### proceed to next round [POST]

proceed to the next round.
::: warning
if the next round exceeds total round, throws an error.
:::
 + Request (application/json)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Tournament)
        + log (array[object])

### rollback round [DELETE]

moves back to the prior round.
::: warning
if the round to rollback is 1, throws an error.
:::
 + Request (application/json)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Tournament)
        + log (array[object])

### update round config [PATCH]

updates round config.
::: warning
if the round to rollback is 1, throws an error.
:::
 + Request (application/json)

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (Tournament)
        + log (array[object])

# Group Entities, Raw Results

* each resouce url accepts object or array[object]
* also each resource url has sub url of the individual entities where you don't have to request entity id for GET/PUT/DELETE methods though POST method is not available in the sub url.

## teams [/tournaments/{tournament_id}/teams]

### search or read all teams [GET]

 * read all teams or search teams on specified condition at query
 * NO SIDE EFFECT

 + Parameters

 + Response 200 (application/json)

### create a team [POST]

 * create a team
 * if force option is true, creates a team even if the same name team already exists, otherwise throws an error.

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

### delete a team [DELETE]

* deletes a team.
::: warning
throws an error if the specified team does not exist.
:::

## adjudicators [/tournaments/{tournament_id}/adjudicators]

## specific adjudicator [/tournaments/{tournament_id}/adjudicator/{adjudicator_id}]

## venues [/tournaments/{tournament_id}/venues]

## specific venue [/tournaments/{tournament_id}/venues/{venue_id}]

## debaters [/tournaments/{tournament_id}/debaters]

## specific debater [/tournaments/{tournament_id}/debaters/{debater_id}]

## institutions [/tournaments/{tournament_id}/institutions]

## specific institution [/tournaments/{tournament_id}/institutions/{institution_id}]

## raw team results [/tournaments/{tournament_id}/teams/results/raw]

### get raw team result [GET]

## raw adjudicator results [/tournaments/{tournament_id}/adjudicators/results/raw]

## raw debater results [/tournaments/{tournament_id}/debaters/results/raw]

# Group Allocation

## allocations [/tournaments/{tournament_id}/allocations]

There is no DELETE method in allocations endpoint

### get saved allocation [GET]

### save an allocation [POST]

### update saved allocation [PUT]

<!--
### check an allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])-->

### compute an allocation [PATCH]
* computes an allocation for current round. Can be a shortcut for computing all team/adjudicator/venue allocation at once.

+ Request (application/json)
   + Attributes
       + options (AllocationOptions, optional)

+ Response 200 (application/json)
   + Attributes
       + errors (array[object])
       + data (array[Square])
       + log (array[object])

## team allocations [/tournaments/{tournament_id}/allocations/teams]

### compute a team allocation [PATCH]

 * if simple option is true, it doesn't use debater scores in computing matchups.

+ Request (application/json)
    + Attributes
        + options (TeamAllocationOptions, optional)

+ Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

## adjudicator allocations [/tournaments/{tournament_id}/allocations/adjudicators]

### compute an adjudicator allocation [PATCH]

 * computes an adjudicator allocation based on given team allocation

+ Request (application/json)
    + Attributes
        + allocation (array[Square], required)
        + options (AdjudicatorAllocationOptions, optional)

+ Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (array[Square])
        + log (array[object])

## venue allocations [/tournaments/{tournament_id}/allocations/venues]

### compute venue allocation [PATCH]

 * computes a venue allocation based on given team/adjudicator allocation
 * if force is true, it allocates venues even if venues are fewer than squares.
 * if shuffle is true, it shuffles venues so that no one can recognize current team rankings.

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

### get team result [GET]

 * returns compiled team results. if rounds is not specified, it compiles all raw results including those collected in the current round.

 + Parameters
    + rounds (array[number] | number, optional)
        + default: [1, ..., current_round_num]
    + force (boolean, optional)
        + default: false

 + Response 200 (application/json)
    + Attributes
        + errors (array[object])
        + data (RawTeamResult)
        + log (array[object])

## adjudicator results [/tournaments/{tournament_id}/adjudicators/results]

## debater results [/tournaments/{tournament_id}/debaters/results]

<!--
### check team allocation [PATCH]

+ Request (application/json)
+ Attributes (array[Square])

+ Response 200 (application/json)
+ Attributes
+ errors (array[object])
+ data (array[Square])
+ log (array[object])-->
<!--
### check adjudicator allocation [PATCH]

+ Request (application/json)
+ Attributes (array[Square])

+ Response 200 (application/json)
+ Attributes
+ errors (array[object])
+ data (array[Square])
+ log (array[object])-->
<!--
### check venue allocation []

+ Request (application/json)
+ Attributes (array[Square])

+ Response 200 (application/json)
+ Attributes
+ errors (array[object])
+ data (array[Square])
+ log (array[object])-->
