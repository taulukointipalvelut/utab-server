class DoesNotExist extends Error {
    constructor(identity) {
        super('DoesNotExist')
        this.identity = identity
        this.code = 551
        this.text = 'The target with identity '+this.identity.toString()+'does not exist'
        this.msg = 'DoesNotExist'
    }
}

class AlreadyExists extends Error {
    constructor(identity) {
        super('AlreadyExists')
        this.identity = identity
        this.code = 552
        this.text = 'The target with identity '+this.identity.toString()+'does not exist'
        this.msg = 'AlreadyExists'
    }
}

exports.DoesNotExist = DoesNotExist
exports.AlreadyExists = AlreadyExists
