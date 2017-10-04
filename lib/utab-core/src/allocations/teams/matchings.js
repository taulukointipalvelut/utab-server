"use strict";
var loggers = require('../../general/loggers.js')
/*function m_gale_shapley (ts, ranks) { // modified gale shapley algorithm
    var matching = {}
    var rank_pointers = {}
    for (var t of ts) {
        matching[t] = []
        rank_pointers[t] = 0
    }

    var remaining = [].concat(ts)
    while (remaining.length > 1) {
        var ap = remaining[0]
        for (var i = rank_pointers[ap]; i < ranks[ap].length; i++) {
            var op = ranks[ap][i]
            if (matching[op].length === 0 || ranks[op].indexOf(matching[op][0]) > ranks[op].indexOf(ap)) {
                if (matching[op].length !== 0) {
                    rank_pointers[matching[op][0]] += 1
                    matching[matching[op][0]] = []
                }
                matching[ap] = [op]
                matching[op] = [ap]
                break
            } else {
                rank_pointers[ap] += 1
            }
        }
        remaining = ts.filter(t => matching[t].length === 0)
    }
    return matching
}
*/

function get_max_rank_matcher(ranks, op, matched) {
    var matched_ranks = matched.map(m => ranks[op].indexOf(m))
    var max_rank = matched_ranks.reduce((a, b)=>Math.max(a, b))
    return matched.filter(m => ranks[op].indexOf(m) === max_rank)[0]
}

function isbetter(ranks, op, matched, ap) {
    var max_rank_matcher = get_max_rank_matcher(ranks, op, matched)

    if (ranks[op].indexOf(ap) < ranks[op].indexOf(max_rank_matcher)) {
        return true
    } else {
        return false
    }
}

function m_gale_shapley (ts, ranks, cap=1) { // modified gale shapley algorithm
    loggers.silly_logger(m_gale_shapley, arguments, 'draws', __filename)
    var matching = {}
    var rank_pointers = {}
    for (var t of ts) {
        matching[t] = []
        rank_pointers[t] = 0
    }

    var remaining = [].concat(ts)
    while (remaining.length > 1) {

        var ap = remaining[0]//approacher
        for (var i = rank_pointers[ap]; i < ranks[ap].length; i++) {/////////////////
            var op = ranks[ap][i]
            if (matching[op].length < cap || isbetter(ranks, op, matching[op], ap)) {

                if (matching[op].length === cap) {
                    var max_rank_matcher = get_max_rank_matcher(ranks, op, matching[op])
                    rank_pointers[max_rank_matcher] += 1
                    matching[max_rank_matcher] = matching[max_rank_matcher].filter(n => n !== op)
                    matching[op] = matching[op].filter(n => n !== max_rank_matcher)
                }

                matching[ap].push(op)
                matching[op].push(ap)
                break
            } else {
                rank_pointers[ap] += 1
            }
        }
        remaining = ts.filter(t => matching[t].length < cap)
    }
    return matching
}

//console.log(m_gale_shapley_multi([0, 1, 2, 3], {0: [1, 2, 3], 1: [0, 2, 3], 2: [0, 1, 3], 3: [0, 1, 2]}, 1))
//console.log(m_gale_shapley([0, 1, 2, 3], {0: [1, 2, 3], 1: [0, 2, 3], 2: [0, 1, 3], 3: [0, 1, 2]}))


//exports.m_gale_shapley_multi = m_gale_shapley_multi
exports.m_gale_shapley = m_gale_shapley
