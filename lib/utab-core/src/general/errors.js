var loggers = require('./loggers.js')

class DoesNotExist extends Error {
    constructor(identity) {
        super('DoesNotExist')
        loggers.silly_logger(DoesNotExist, arguments, 'general', __filename)
        this.identity = identity
        this.code = 404
        this.message = 'The target with identity '+JSON.stringify(this.identity)+' does not exist'
        this.name = 'DoesNotExist'
    }
}

class AlreadyExists extends Error {
    constructor(identity) {
        super('AlreadyExists')
        loggers.silly_logger(AlreadyExists, arguments, 'general', __filename)
        this.identity = identity
        this.code = 409
        this.message = 'The target with identity '+JSON.stringify(this.identity)+' already exists'
        this.name = 'AlreadyExists'
    }
}

class ResultNotSent extends Error {
    constructor(name, role, r) {
        super('ResultNotSent')
        loggers.silly_logger(ResultNotSent, arguments, 'general', __filename)
        this.name = name
        this.role = role
        this.r = r
        this.code = 412
        this.message = 'The result of '+this.role+' '+this.name+' in round '+this.r+' is not sent'
        this.name = 'ResultNotSent'
    }
}

class WinPointsDifferent extends Error {
    constructor(name, wins) {
        super('WinPointsDifferent')
        loggers.silly_logger(WinPointsDifferent, arguments, 'general', __filename)
        this.name = name
        this.wins = wins
        this.code = 412
        this.message = 'Win(Win-points) is not unified on team '+name.toString()+', win points('+this.wins.toString()+')'
        this.name = 'WinPointsDifferent'
    }
}

class SpeakersDifferent extends Error {
    constructor(name) {
        super('SpeakersDifferent')
        loggers.silly_logger(SpeakersDifferent, arguments, 'general', __filename)
        this.name = name
        this.code = 412
        this.message = 'Speakers or speaker orders are not unified on speaker'+name.toString()
        this.name = 'SpeakersDifferent'
    }
}

class NeedMore extends Error {
    constructor(role, atleast) {
        super('NeedMore'+role.charAt(0).toUpperCase() + role.slice(1))
        loggers.silly_logger(NeedMore, arguments, 'general', __filename)
        this.role = role
        this.atleast = atleast
        this.code = 412
        this.message = 'At least '+this.atleast.toString()+' more available '+this.role.toString()+'s are needed'
        this.name = 'NeedMore'+this.role.charAt(0).toUpperCase() + this.role.slice(1)
    }
}

class EntityNotRegistered extends Error {
    constructor(id, role) {
        super(role.charAt(0).toUpperCase()+role.slice(1)+'NotRegistered')
        loggers.silly_logger(EntityNotRegistered, arguments, 'general', __filename)
        this.id = id
        this.role = role
        this.code = 412
        this.message = this.role.charAt(0).toUpperCase()+this.role.slice(1)+' '+this.id+' is not registered'
        this.name = this.role.charAt(0).toUpperCase()+this.role.slice(1)+'NotRegistered'
    }
}

class DetailNotDefined extends Error {
    constructor(name, r) {
        super('DetailNotDefined')
        loggers.silly_logger(DetailNotDefined, arguments, 'general', __filename)
        this.name = name
        this.r = r
        this.code = 412
        this.message = 'details of name ('+name+') in round '+r.toString()+' is not defined'
        this.name = 'DetailNotDefined'
    }
}

exports.DoesNotExist = DoesNotExist
exports.AlreadyExists = AlreadyExists
exports.ResultNotSent = ResultNotSent
exports.WinPointsDifferent = WinPointsDifferent
exports.SpeakersDifferent = SpeakersDifferent
exports.NeedMore = NeedMore
exports.EntityNotRegistered = EntityNotRegistered
exports.DetailNotDefined = DetailNotDefined
