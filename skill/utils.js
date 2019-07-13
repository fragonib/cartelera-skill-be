const or = (...fns) => a => fns.reduce((r, f) => r || f(a), false);

module.exports = {
    or: or
};