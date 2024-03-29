"use strict";
var errors = require('./errors.js')
var loggers = require('./loggers.js')

function find_one(list, id) {
    return list.filter(e => e.id === id)[0]
}

function access_detail(e, r) {
    let filtered = e.details.filter(d => d.r === r)
    if (filtered.length === 0) {
        throw new errors.DetailNotDefined(e.name, r)
    }
    return filtered[0]
}

function find_and_access_detail(list, id, r) {
    let e = find_one(list, id)
    return access_detail(e, r)
}

function filter_available(list, r) {
    return list.filter(e => access_detail(e, r).available)
}

function check_detail(xs, r) {
    loggers.silly_logger(check_detail, arguments, 'general', __filename)
    for (let x of xs) {
        if (x.details.filter(detail => detail.r === r).length === 0) {
            throw new errors.DetailNotDefined(x.name, r)
        }
    }
}

exports.find_one = find_one
exports.access_detail = access_detail
exports.filter_available = filter_available
exports.find_and_access_detail = find_and_access_detail
exports.check_detail = check_detail
