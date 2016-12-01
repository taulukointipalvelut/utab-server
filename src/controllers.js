let handlers = require('./controllers/handlers.js')

class CON {
    constructor(dict) {
        let tournaments_handler = new handlers.DBTournamentsHandler(dict)
        this.tournaments = tournaments_handler.tournaments
        this.close = tournaments_handler.close
    }
}

exports.CON = CON
