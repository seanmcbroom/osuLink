let Util = {};

Util.addCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

Util.clamp = (number, min, max) => {
    return Math.min(Math.max(number, min), max)
}

Util.msToHumanReadable = (ms) => {
    ms = ms / 1000
    const days = Math.floor(ms / (24 * 3600))
    ms %= (24 * 3600)
    const hours = Math.floor(ms / 3600)
    ms %= 3600
    const minutes = Math.floor(ms / 60)
    ms %= 60
    const seconds = Math.floor(ms)

    return ((days > 0 && `${days}d, ` || '') + (hours > 0 && `${hours}h, ` || '') + (minutes > 0 && `${minutes}m, ` || '') + `${seconds}s`)
}

Util.msToHours = (ms) => {
    ms = ms / 1000
    const hours = Math.floor(ms / 3600);

    return Util.addCommas(hours);
}

Util.formatTimeMinutesSeconds = (ms) => {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const minutes = ((ms / 1000) % 3600) / 60

    return [minutes, (ms / 1000) % 60].map(format).join(':')
}

Util.evalStringExpression = (string) => {
    let comparisons = {
        "==": function (a, b) { return (parseInt(a) == parseInt(b)) },
        "!=": function (a, b) { return (parseInt(a) != parseInt(b)) },
        ">=": function (a, b) { return (parseInt(a) >= parseInt(b)) },
        ">": function (a, b) { return (parseInt(a) > parseInt(b)) },
        "<=": function (a, b) { return (parseInt(a) <= parseInt(b)) },
        "<": function (a, b) { return (parseInt(a) < parseInt(b)) },
        "and": function (a, b) { return (evalExpression(a) && evalExpression(b)) },
        "or": function (a, b) { return (evalExpression(a) || evalExpression(b)) },
    }

    function evalExpression(string) {
        let Expression = string.split(" ")

        let Comparison = Expression[Math.floor(Expression.length / 2)]
        let a = string.substring(0, string.indexOf(Comparison) - 1)
        let b = string.substring(string.indexOf(Comparison) + Comparison.length + 1)

        if (comparisons[Comparison]) {
            return comparisons[Comparison](a, b)
        }
    }

    return evalExpression(string)
}

Util.find = (collection, callback) => {
    var found = null;

    collection.forEach(i => {
        if (callback(i)) {
            found = i;
        }
    });

    return found;
}

module.exports = Util;