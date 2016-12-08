class DoesNotExist extends Error {
    constructor(identity) {
        super('DoesNotExist')
        this.identity = identity
        this.code = 404
        this.message = 'The target with identity '+JSON.stringify(this.identity)+' does not exist'
        this.name = 'DoesNotExist'
    }
}

class AlreadyExists extends Error {
    constructor(identity) {
        super('AlreadyExists')
        this.identity = identity
        this.code = 409
        this.message = 'The target with identity '+JSON.stringify(this.identity)+' already exists'
        this.name = 'AlreadyExists'
    }
}

exports.DoesNotExist = DoesNotExist
exports.AlreadyExists = AlreadyExists
