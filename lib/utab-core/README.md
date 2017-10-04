# UTab-core

Interfaces of Simpler and faster utab-core in Nodejs and of Database handler.

The original version of utab-core in Python is [here](https://github.com/nswa17/utab-api-server-old-).

## Files

 + "CHANGELOG.md" - Release notes
 + "TERMS.md" - Terms

## Documents

Documentation for version 2 is available at [here](https://taulukointipalvelut.github.io/)

## Usage

1. Clone this repository. `$ git clone https://github.com/taulukointipalvelut/utab-core`

1. Start MongoDB. `$ mongod`

1. Import utab.js and create an instance.
```javascript
var utab = require('./utab-core/utab.js')

var t1 = new utab.Tournament({name: "6th test tournament"}) // create a tournament

t1.teams.create({id: 1}) // create a team
t1.close()//close connection to database for t1
```

## Features

1. Strict validation for database

<!--New Matching Algorithms derived from Gale Shapley Algorithm-->

## Attention

1. You should either set pre-evaluation to all adjudicators, or to no adjudicator.

1. All return values from database functions are treated as Promise objects

1. Expected total round num is 1 ~ 6.

1. judge-pre-evaluation should be evaluated as same criteria as judge evaluation at the tournament.

1. If num of chairs is odd, they should discuss who is the winner and send the same `win`.

1. ID, which is unique and constant in all entities throughout adjudicators/teams/speakers, of result sender should be specified when sending result.

## Future Coming

### utab-core version 1.0 <!--[Candle Light]--> (by 2016/11/20)

**To have basic functions**

Planning to support

1. New matching algorithms
1. database(MongoDB)
1. All basic functions

### utab-core version 2.0 <!--[Luna Flight]--> (by the end of Descember 2016)

**To have more safety**

Planning to support

1. Stricter validation
1. Multiple chairs, panels, trainees
1. New algorithms

### utab-core version 3.0 <!--[Frosty Night]--> (in 2017)

**To improve internal algorithms**

Planning to support

1. Mstat

### utab-core future version *

1. Modifying result after rounds

## ROLE OF EACH MODULE

 * utab.js: tournament management interface
     * allocations.js: functions to compute allocations
     * results.js: functions to summarize/check results
     * controllers.js: database management interface

```
utab.js
    │
    ├─src/allocations.js
    │    |
    │    ├─src/allocations/teams.js
    │    │    ├─src/allocations/teams/filters.js
    │    │    ├─src/allocations/teams/matchings.js
    │    │    └─src/allocations/teams/strict_matchings.js
    │    │
    │    ├─src/allocations/adjudicators.js
    │    │    ├─src/allocations/adjudicators/adfilters.js
    │    │    └─src/allocations/adjudicators/matchings.js
    │    │
    │    └─src/allocations/venues.js
    │    
    ├─src/results.js
    │    ├─src/results/sortings.js
    │    └─src/general/math.js
    │
    └─src/controllers.js
         └─src/controllers/database.js
               └─src/controllers/schemas.js
```
