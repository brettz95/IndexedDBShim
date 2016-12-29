const _colors = typeof process !== 'undefined' ? require('colors/safe') : null;

this.colors = new Proxy({
    setTheme: function (theme) {
        this._theme = theme;
    },
    log: function (msgColor) {
        console.log(...msgColor);
    }
}, {
    get: function (target, name) {
        if (['setTheme', 'log', '_theme'].includes(name)) {
            return target[name];
        }
        const log = (/log/).test(name);
        name = log ? name.slice(3).toLowerCase() : name;
        let color = name;
        if (name in target._theme) {
            color = target._theme[name];
        }
        const ret = function (msg) {
            if (_colors) { // We add this to work with single arg of Node
                return [_colors[color](msg)];
            }
            return ['%c' + msg, 'color: ' + color];
        };
        if (log) {
            return function (msgColor) {
                target.log(ret(msgColor));
            };
        }
        return ret;
    }
});
