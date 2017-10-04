"use strict"

const winston = require('winston')
const path = require('path')

function get_latest_filename(filenames) {
    if (filenames.length === 0) {
        return null
    }
    var dates = filenames.map(fn => parseInt(fn.split('.')[0]))
    return Math.max(...dates).toString() + '.log'
}

function console_logger() {
    return {
        level: 'verbose',
        colorize: true,
        timestamp: function() {
            let dt = new Date()
            return dt.getFullYear() +'/'+ dt.getMonth() +'/'+ dt.getDate() +' '+ dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()
        }
    }
}

function file_logger(fn) {
    return {
        level: 'silly',
        json: false,
        name: 'main',
        filename: __dirname+'/../../log/'+fn,
        timestamp: function() {
            let dt = new Date()
            return dt.getFullYear() +'/'+ dt.getMonth() +'/'+ dt.getDate() +' '+ dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()
        }
    }
}

function add_custom_loggers(fn) {
    if (fn !== "") {
        winston.loggers.add('log_controllers', {
            console: console_logger(),
            file: file_logger(fn)
        })

        winston.loggers.add('log_draws', {
            console: console_logger(),
            file: file_logger(fn)
        })

        winston.loggers.add('log_results', {
            console: console_logger(),
            file: file_logger(fn)
        })

        winston.loggers.add('log_checks', {
            console: console_logger(),
            file: file_logger(fn)
        })

        winston.loggers.add('log_general', {
            console: console_logger(),
            file: file_logger(fn)
        })

    } else {
        winston.loggers.add('log_controllers', {
            console: console_logger()
        })

        winston.loggers.add('log_draws', {
            console: console_logger()
        })

        winston.loggers.add('log_results', {
            console: console_logger()
        })

        winston.loggers.add('log_checks', {
            console: console_logger()
        })

        winston.loggers.add('log_general', {
            console: console_logger()
        })
    }

    log_controllers = winston.loggers.get('log_controllers')
    log_draws = winston.loggers.get('log_draws')
    log_results = winston.loggers.get('log_results')
    log_checks = winston.loggers.get('log_checks')
    log_general = winston.loggers.get('log_general')
}

function init() {
    winston.loggers.close()
    var fn = Date.now()+'.log'
    add_custom_loggers(fn)
}

let log_controllers, log_draws, log_results, log_checks, log_general

try {
    console.log(navigator.appName)
    var fn = ""
} catch(e) {
    const fs = require('fs')
    var fns = fs.readdirSync(__dirname+'/../../log')
    var fn = get_latest_filename(fns)
}

fn !== null ? add_custom_loggers(fn) : null

function get(name) {
    return winston.loggers.get(name)
}

let controllers = function(a, b) {
    return b ? log_controllers.log(a, b) : log_controllers.info(a)
}

let draws = function(a, b) {
    return b ? log_draws.log(a, b) : log_draws.info(a)
}

let results = function(a, b) {
    return b ? log_results.log(a, b) : log_results.info(a)
}

let checks = function(a, b) {
    return b ? log_checks.log(a, b) : log_checks.info(a)
}

let general = function(a, b) {
    return b ? log_general.log(a, b) : log_general.info(a)
}

let parts = {
    'controllers': controllers,
    'draws': draws,
    'results': results,
    'checks': checks,
    'general': general
}

let silly_logger = function(f, _arguments, part, filename="") {
    parts[part]('debug', 'function '+f.name+' is called @ '+path.basename(filename)+' in '+part+' branch')
    parts[part]('silly', 'arguments are '+JSON.stringify(_arguments))
}

exports.init = init
exports.draws = draws
exports.results = results
exports.checks = checks
exports.controllers = controllers
exports.general = general
exports.silly_logger = silly_logger
