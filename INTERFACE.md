FORMAT: 1A

## Data Structures

### CreateTournament
+ name: testtournament (string, optional)
    + default: testtournament
+ db_url: mongodb://localhost/testtournament (string, optional)
    + default: mongodb://localhost/testtournament
+ style: NA (string, optional)
    + default: NA
+ total_round_num: 4 (number, optional)
    + default: 4
+ current_round_num: 1 (number, optional)
    + default: 1
+ user_defined_data: {} (object, optional)
    + default: {}

### Tournament
+ name: testtournament (string)
+ db_url: mongodb://localhost/testtournament (string)
+ style: NA (string)
+ total_round_num: 4 (number)
+ current_round_num: 1 (number)
+ user_defined_data: {} (object)

### ModifyTournament
+ name: testtournament (string, required)
+ db_url: mongodb://localhost/testtournament (string, optional)
+ style: NA (string, optional)
+ total_round_num: 4 (number, optional)
+ current_round_num: 1 (number, optional)
+ user_defined_data: {} (object, optional)

### SpecifyTournament
+ name: testtournament (string)

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

# Group Database

## teams [/{tournament_name}/teams]

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


 + Request (application/json)

    + Attributes (CreateTeam)

 + Response 200 (application/json)

    + Attributes (Team)

### update a team [PUT]

 * updates a team.
 * throws an error if the specified team does not exist.

+ Request (application/json)
    + Attributes (ModifyTeam)

+ Response (application/json)
    + Attributes (Team)

### delete a team [DELETE]

* deletes a team.
* throws an error if the specified team does not exist.

+ Request (application/json)
    + Attributes (SpecifyTeam)

+ Response (application/json)
    + Attributes (Team)

# Group Allocation

## allocations [/{tournament_name}/allocations]

There is no DELETE method in allocations endpoint

### get/compute an allocation [GET]

 * if the round is specified, returns an allocation, otherwise computes an allocation for current round. if specified round is the current round, computes an allocation. Can be a shortcut for computing all team/adjudicator/venue allocation at once.
 * if the specified round exceeds current round, throws an error.

 + Parameters
  + round (number, optional)

+ Response 200 (application/json)
    + Attributes (array[Square])

+ Response 404

### save an allocation [POST]

### update saved allocation [PUT]

### delete saved allocation [DELETE]

### check an allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

## team allocations [/{tournament_name}/allocations/teams]

### compute a team allocation [GET]

 + Parameters
  + force (boolean, optional)
        + default: false
  + allocation (array[Square], optional)
  + check (boolean, optional)

+ Response 200 (application/json)
    + Attributes (array[Square])

### check team allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

## adjudicator allocations [/{tournament_name}/allocations/adjudicators]

### compute an adjudicator allocation [GET]

 * computes an adjudicator allocation based on given team allocation

 + Parameters
  + force (boolean, optional)
        + default: false
  + allocation (array[Square], required)

+ Response 200 (application/json)
    + Attributes (array[Square])

### check adjudicator allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

## venue allocations [/{tournament_name}/allocations/venues]

### compute venue allocation [GET]

 * computes a venue allocation based on given team/adjudicator allocation

 + Parameters
      + force (boolean, optional)
            + default: false
      + allocation (array[Square], required)

 + Response 200 (application/json)
    + Attributes (array[Square])

### check venue allocation [PATCH]

 + Request (application/json)
    + Attributes (array[Square])

 + Response 200 (application/json)
    + Attributes (array[Square])

# Group Result

## results [/{tournament_name}/teams/results]

### get team result [GET]

 * reads/finds raw team results. if compile is true, returns compiled team results on specified rounds

 + Parameters
    + compile (boolean, optional)
         + default: false
    + rounds (array[number], optional)
         + default: [1, ..., current_round_num]

 + Response 200 (application/json)
    + Attributes (RawTeamResult)

### create raw team result [POST]

### update raw team result [PUT]

### delete raw team result [DELETE]
