const _try = function(func, fallbackValue) {
    try {
        const value = func();
        return (value === null || value === undefined) ? fallbackValue : value;
    } catch (e) {
        return fallbackValue;
    }
};

module.exports = {
    _try: _try
};