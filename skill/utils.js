const or = (...fns) => a => fns.reduce((r, f) => r || f(a), false);
const iff = cond => f => a => cond(a) ? f(a) : S.Just(a);
const callbackToPromise = function(callback) {
    return param => new Promise((resolve) => {
        callback(param, (result) => {
            resolve(result);
        });
    });
};

module.exports = {
    or: or,
    iff: iff,
    callbackToPromise: callbackToPromise
};