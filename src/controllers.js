let handlers = require('./controllers/handlers.js')

class CON {
    constructor(dict) {
        let styles_handler = new handlers.DBStylesHandler(dict)
        let users_handler = new handlers.DBUsersHandler(dict)
        this.styles = styles_handler.styles
        this.users = users_handler.users
        this.close = function () {
            styles_handler.close()
            users_handler.close()
        }
    }
}

exports.CON = CON
