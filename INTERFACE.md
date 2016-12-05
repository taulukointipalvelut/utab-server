FORMAT: 1A

## Data Structures

### CreateTournament
+ name: testtournament (string, required)
    + default: testtournament
+ style: NA (string, optional)
    + default: NA
+ total_round_num: 4 (number, optional)
    + default: 4
+ current_round_num: 1 (number, optional)
    + default: 1
+ user_defined_data: {} (object, optional)
    + default: {}

### Tournament
+ id: 32141324123 (number)
+ name: testtournament (string)
+ style: NA (string)
+ total_round_num: 4 (number)
+ current_round_num: 1 (number)
+ user_defined_data: {} (object)

### ModifyTournament
+ id: 32141324123 (number, required)
+ name: testtournament (string, optional)
+ style: NA (string, optional)
+ total_round_num: 4 (number, optional)
+ current_round_num: 1 (number, optional)
+ user_defined_data: {} (object, optional)

### SpecifyTournament
+ id: 32141324123 (number, required)

### CreateTeam
+ name: kymstr (string, required)
+ available: true (boolean, optional)
    + default: true
+ user_defined_data: {} (object, optional)
    + default: {}

### Team
+ id: 1324908734 (number)
+ name: kymstr (string)
+ available: true (boolean)
+ user_defined_data: {} (object)


### ModifyTeam
+ id: 1324908734 (number, required)
+ name: kymstr (string, optional)
+ available: true (boolean, optional)
+ user_defined_data: {} (object, optional)

### SpecifyTeam
+ id: 1324908734 (number, required)

### SquareWarning
+ msg: InstitutionConflict (string)

### Square
+ id: 3
+ teams: [1, 2] (array[number])
+ chairs: [1] (array[number])
+ panels: [4, 6] (array[number])
+ trainees: [] (array[number])
+ warnings: [] (array[SquareWarning])

### RawTeamResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ from_id: 232342346 (number)
+ win: 1 (number)
+ side: gov (string)
+ opponents: [4352432524] (array[number])
+ user_defined_data: {} (object)

### RawDebaterResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ from_id: 232342346 (number)
+ scores: [75, 0, 38.5] (array[number])
+ user_defined_data: {} (object)

### RawAdjudicatorResult
+ id: 3432522346 (number)
+ r: 1 (number)
+ from_id: 232342346 (number)
+ score: 7 (number)
+ judged_teams: [32423423, 42512132] (array[number])
+ comment: Good adjudicator (string)
+ user_defined_data: {} (object)

# UTab Operation API

# Group Tournaments

## tournaments [/tournaments]

### search or read all tournaments [GET]

+ Response 200 (application/json)
    + Attributes (array[Tournament])

### create a tournament [POST]

+ Request (application/json)
    + Attributes (CreateTournament)

+ Response 200 (application/json)
    + Attributes (array[Tournament])

### update a tournament [PUT]

+ Request (application/json)
    + Attributes (ModifyTournament)

### delete a tournament [DELETE]

+ Request (application/json)
    + Attributes (SpecifyTournament)

+ Response 200 (application/json)
    + Attributes (array[Tournament])

# Group Rounds

## rounds [/tournaments/{tournament_id}]

### show status [GET]

 + Response 200 (application/json)
    + Attributes (Tournament)

### proceed to next round [POST]

::: warning
if the next round exceeds total round, throws an error.
:::
 + Request (application/json)

 + Response 200 (application/json)
    + Attributes (Tournament)

### rollback round [DELETE]

::: warning
if the round to rollback is 1, throws an error.
:::

### update round config [PATCH]

# Group Database of entities, relations

## teams [/tournaments/{tournament_id}/teams]

### search or read all teams [GET]

#### summary

 * read all teams or search teams on specified condition at query
 * NO SIDE EFFECT

 + Parameters

  + name: TEAMALPHA (string, optional)
  + id: 234432847 (number, optional)
  + institutions: [324788234, 2340870923] (array[number], optional)

 + Response 200 (application/json)

### create a team [POST]

 * create a team
 * if force option is true, creates a team even if the same name team already exists, otherwise throws an error.

 + Request Single (application/json)

    + Attributes (CreateTeam)

 + Request Multiple (application/json)

    + Attributes (array[CreateTeam])

 + Response 200 (application/json)

    requested data with created id

### update a team [PUT]

 * updates a team.

 ::: warning
 throws an error if the specified team does not exist.
 :::


+ Request (application/json)
    + Attributes (ModifyTeam)

+ Response (application/json)
    + Attributes (Team)

### delete a team [DELETE]

* deletes a team.
::: warning
throws an error if the specified team does not exist.
:::

+ Request (application/json)
    + Attributes (SpecifyTeam)

+ Response (application/json)
    + Attributes (Team)

# Group Allocation

## allocations [/tournaments/{tournament_id}/allocations]

There is no DELETE method in allocations endpoint

### get/compute an allocation [GET]

 * if the round is specified, returns an allocation, otherwise computes an allocation for current round. if specified round is the current round, computes an allocation. Can be a shortcut for computing all team/adjudicator/venue allocation at once.
 ::: warning
 if the specified round exceeds current round, throws an error.
 :::

 + Parameters
    + round (number, optional)
    + simple (boolean, optional)
     + default: false
    + force (boolean, optional)
     + default: false
    + team_allocation_algorithm (string, optional)
     + default: 'standard'
    + team_allocation_algorithm_options (object, optional)
     + default: {
                         "filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution']
                    }
    + shuffle (boolean, optional)
     + default: true
    + adjudicator_allocation_algorithm (string, optional)
     + default: 'standard'
    + adjudicator_allocation_algorithm_options (object, optional)
     + default: {
                       "filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],
                       "assign": 'high_to_high',
                       "scatter": false
                  }
    + numbers (object, optional)
     + default: {
                       "chairs": 2,
                       "panels": 1,
                       "trainees": 1
                  }

+ Response 200 (application/json)
    + Attributes (array[Square])

### save an allocation [POST]

### update saved allocation [PUT]

### delete saved allocation [DELETE]

### check an allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

## team allocations [/tournaments/{tournament_id}/allocations/teams]

### compute a team allocation [GET]

 * if simple option is true, it doesn't use debater scores in computing matchups.

 + Parameters
  + simple (boolean, optional)
        + default: false
  + force (boolean, optional)
        + default: false
  + algorithm (string, optional)
        + default: 'standard'
  + algorithm_options (object, optional)
        + default: {
                        "filters": ['by_strength', 'by_side', 'by_past_opponent', 'by_institution']
                   }

+ Response 200 (application/json)
    + Attributes (array[Square])

### check team allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

## adjudicator allocations [/tournaments/{tournament_id}/allocations/adjudicators]

### compute an adjudicator allocation [GET]

 * computes an adjudicator allocation based on given team allocation

 + Parameters
  + allocation (array[Square], required)
  + simple (boolean, optional)
        + default: false
  + force (boolean, optional)
        + default: false
  + algorithm (string, optional)
        + default: 'standard'
  + algorithm_options (object, optional)
        + default: {
                        "filters": ['by_bubble', 'by_strength', 'by_attendance', 'by_conflict', 'by_institution', 'by_past'],
                        "assign": 'high_to_high',
                        "scatter": false
                   }
  + numbers (object, optional)
        + default: {
                        "chairs": 2,
                        "panels": 1,
                        "trainees": 1
                   }

+ Response 200 (application/json)
    + Attributes (array[Square])

### check adjudicator allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

## venue allocations [/tournaments/{tournament_id}/allocations/venues]

### compute venue allocation [GET]

 * computes a venue allocation based on given team/adjudicator allocation
 * if force is true, it allocates venues even if venues are fewer than squares.
 * if shuffle is true, it shuffles venues so that no one can recognize current team rankings.

 + Parameters
      + allocation (array[Square], required)
      + force (boolean, optional)
          + default: false
      + shuffle (boolean, optional)
          + default: true

 + Response 200 (application/json)
    + Attributes (array[Square])

### check venue allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

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
    + Attributes (RawTeamResult)

## adjudicator results [/tournaments/{tournament_id}/adjudicators/results]

## venue results [/tournaments/{tournament_id}/adjudicators/results]

## team results [/tournaments/{tournament_id}/teams/results/raw]

### get raw team result [GET]

## adjudicator results [/tournaments/{tournament_id}/adjudicators/results/raw]

## venue results [/tournaments/{tournament_id}/adjudicators/results/raw]
