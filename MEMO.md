# UTab operating memo

Also see postman/demo

## Resource URLs

### About Styles

* [/styles]

1. GET (search or read)

1. POST (create one)

### About tournaments

* [/tournaments]

1. GET (search or read)

1. POST (create one)

* [/tournaments/:tournament_id]

1. GET (read tournament config)

1. PUT (update tournament config)

1. DELETE (delete a tournament)

### About rounds

* [/tournaments/:tournament_id/rounds]

1. GET (search or read)

1. POST (create one(s))

* [/tournaments/:tournament_id/rounds/:r]

1. GET (search or read)

1. PUT (update one(s))

1. DELETE (delete one(s))

### About raw results

* [/tournaments/:tournament_id/results/raw/teams]

* [/tournaments/:tournament_id/results/raw/debaters]

* [/tournaments/:tournament_id/results/raw/adjudicators]

1. GET (search or read)

1. POST (create one(s))

1. DELETE (delete all) DANGEROUS, UNRECOMMENDED

* [/tournaments/:tournament_id/rounds/:r/results/raw/teams/:id/from_id]

* [/tournaments/:tournament_id/rounds/:r/results/raw/debaters/:id/from_id]

* [/tournaments/:tournament_id/rounds/:r/results/raw/adjudicators/:id/from_id]

1. GET (read an entity)

1. PUT (update an entity)

1. DELETE (delete an entity)

### About entities and draws

* [/tournaments/:tournament_id/teams]

* [/tournaments/:tournament_id/adjudicators]

* [/tournaments/:tournament_id/venues]

* [/tournaments/:tournament_id/debaters]

* [/tournaments/:tournament_id/institutions]

* [/tournaments/:tournament_id/draws]

1. GET (read an entity)

1. POST (create one(s))

1. DELETE (delete all) UNRECOMMENDED

* [/tournaments/:tournament_id/rounds/:r/draws]

* [/tournaments/:tournament_id/teams/:id]

* [/tournaments/:tournament_id/adjudicators/:id]

* [/tournaments/:tournament_id/venues/:id]

* [/tournaments/:tournament_id/debaters/:id]

* [/tournaments/:tournament_id/institutions/:id]

1. GET (read an entity)

1. PUT (update an entity)

1. DELETE (delete an entity)

### About compiled results

* [/tournaments/:tournament_id/teams/results]

* [/tournaments/:tournament_id/debaters/results]

* [/tournaments/:tournament_id/adjudicators/results]

1. PATCH (compile raw results)

### About allocations

* [/tournaments/:tournament_id/allocations]

* [/tournaments/:tournament_id/allocations/teams]

* [/tournaments/:tournament_id/allocations/adjudicators]

* [/tournaments/:tournament_id/allocations/venues]

* [/tournaments/:tournament_id/rounds/:r/allocations]

* [/tournaments/:tournament_id/rounds/:r/allocations/teams]

* [/tournaments/:tournament_id/rounds/:r/allocations/adjudicators]

* [/tournaments/:tournament_id/rounds/:r/allocations/venues]

1. PATCH (compute an allocation)
