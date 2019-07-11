const fs = require('graceful-fs');
const crawler = require(__dirname + '/crawler.js');
const vocalize = require(__dirname + '/vocalize.js');

global.log = console;
global.parameters = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
global.secrets = JSON.parse(fs.readFileSync('secret.json', 'utf-8'));

const wrap_callback_with_promise = function(callback) {
    return param => new Promise((resolve) => {
        callback(param, (result) => {
            resolve(result);
        });
    });
};

const findFilmPromise = wrap_callback_with_promise(crawler.searchFilm);

const rateFilm = query_string => findFilmPromise(query_string).then((film) => {
    return film ? vocalize.vocalizeFilm(film) : vocalize.vocalizeFilmNotFound(query_string);
});

module.exports = {
    rateFilm: rateFilm
};