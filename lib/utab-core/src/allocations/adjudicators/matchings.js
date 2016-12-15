"use strict";
var loggers = require('../../general/loggers.js')
/*
function gale_shapley(gs, as, g_ranks, a_ranks) { //a proposes to b, condition: as.length < bs.length
    if (gs.length > as.length) { throw new Error('gs must be fewer than as') }

    var g_ranks_pointers = {}
    var g_matched = {}
    var a_matched = {}
    var remaining = [].concat(gs)

    for (var g of gs) {
        g_ranks_pointers[g] = 0
        g_matched[g] = []
    }
    for (var a of as) {
        a_matched[a] = null
    }

    while (remaining.length > 0) {
        var pro = remaining[0]
        var rec = g_ranks[pro][g_ranks_pointers[pro]]

        if (a_matched[rec] === null || a_ranks[rec].indexOf(pro) < a_ranks[rec].indexOf(a_matched[rec])) {
            if (a_matched[rec] !== null) {
                g_ranks_pointers[a_matched[rec]] += 1
                g_matched[a_matched[rec]] = []
            }
            a_matched[rec] = pro
            g_matched[pro] = [rec]
        } else {
            g_ranks_pointers[pro] += 1
        }
        remaining = gs.filter(g => g_matched[g].length === 0)
    }
    return g_matched
}
*/
function gale_shapley(gs, as, g_ranks, a_ranks, cap=1) { //a proposes to b, condition: as.length < bs.length
    loggers.silly_logger(gale_shapley, arguments, 'allocations', __filename)
    if (gs.length > as.length) {
        loggers.allocations('error', 'gs must be fewer than as @ gale_shapley')
    }

    var g_ranks_pointers = {}
    var g_matched = {}
    var a_matched = {}
    var remaining = [].concat(gs)

    for (var g of gs) {
        g_ranks_pointers[g] = 0
        g_matched[g] = []
    }
    for (var a of as) {
        a_matched[a] = null
    }

    if (cap === 0) {
        return g_matched
    }

    while (remaining.length > 0) {
        var pro = remaining[0]
        var rec = g_ranks[pro][g_ranks_pointers[pro]]

        if (a_matched[rec] === null || a_ranks[rec].indexOf(pro) < a_ranks[rec].indexOf(a_matched[rec])) {
            if (a_matched[rec] !== null) {
                g_ranks_pointers[a_matched[rec]] += 1
                g_matched[a_matched[rec]] = g_matched[a_matched[rec]].filter(id => id !== rec)
            }
            a_matched[rec] = pro
            g_matched[pro].push(rec)
        } else {
            g_ranks_pointers[pro] += 1
        }
        remaining = gs.filter(g => g_matched[g].length < cap && g_ranks_pointers[g] < g_ranks[g].length)
    }
    return g_matched
}


exports.gale_shapley = gale_shapley

var as = [1, 2]
var bs = [4, 5, 6]

var a_ranks = {1: [4, 5, 6], 2: [5, 4, 6]}
var b_ranks = {4: [1, 2], 5: [2, 1], 6:[2, 1]}
//console.log(gale_shapley(as, bs, a_ranks, b_ranks))
//console.log(gale_shapley_multi(as, bs, a_ranks, b_ranks, 1))
