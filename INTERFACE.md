# UTab Operation API

## Endpoint [/{tournament_name}/teams]

### search or read all [GET]

#### summary

 * read all teams or search teams on specified condition at query
 * NO SIDE EFFECT
 
 + Parameters
  
  + name: TEAMALPHA (string, optional)
  + id: 234432847 (number, optional)
  + institutions: [Institution1, Institution2] (array[number], optional)
  
 + Response 200 (application/json)
 
### create a team [POST]

#### summary

 * create a team
 * if force option is true, creates a team even if the same name team already exists, otherwise throws an error.
 
 + Request (application/json)
    
 + Response 200 (application/json)
 
### update a team [PUT]

#### summary

 * updates a team.
 * throws an error if the specified team does not exist.
 
### delete a team [DELETE]

#### summary

 * deletes a team.
 * throws an error if the specified team does not exist.
 
 
 
## [/{tournament_name}/allocations/teams]

no DELETE method

### get/compute an allocation [GET]

 + Parameters
  + round (number, optional)
  + allocation (array[Square], optional)
  + check (boolean, optional) if true, allocation above should be sent.
  
#### summary
  
 * if the round is specified, returns the saved allocation or computes new allocation.
 * if the specified round exceeds current round, throws an error.
 * if `check` is true, checks the allocation specified and returns it with square warnings.
 
### save an allocation [POST]

### update saved allocation [PUT]

## [/{tournament_name}/teams/results]

### get (raw) team result [GET]

 + Parameters
  + compile (boolean, optional)

### create raw team result [POST]

### update raw team result [PUT]

### delete raw team result [DELETE]
