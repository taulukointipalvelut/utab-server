let handlers = require('./controllers/handlers.js')

class CON {
    constructor(dict) {
        let tournaments_handler = new handlers.DBTournamentsHandler(dict)
        let styles_handler = new handlers.DBStylesHandler(dict)
        this.tournaments = tournaments_handler.tournaments
        this.styles = styles_handler.styles
        this.close = function () {
            tournaments_handler.close()
            styles_handler.close()
        }
    }
}

exports.CON = CON
