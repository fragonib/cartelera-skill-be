const or = (...fns) => a => fns.reduce((r, f) => r || f(a), false);
const iff = cond => f => a => cond(a) ? f(a) : S.Just(a);

module.exports = {
    or: or,
    iff: iff
};