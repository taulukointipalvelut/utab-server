function find_tournament(list, name) {
    return list.filter(e => e.name === name)[0]
}

function get_node(tournaments, tournament_name, keys) {
    let t = find_tournament(tournaments, tournament_name).handler
    return get_property(t, keys)
}

function get_property(object, keys) {//TESTED//
    if (keys.length !== 0) {
        return get_property(object[keys[0]], keys.slice(1))
    } else {
        return object
    }
}

exports.get_node = get_node
