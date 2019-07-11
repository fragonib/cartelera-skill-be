const fs = require('graceful-fs');
const crawler = require(__dirname + '/crawler.js');
const vocalize = require(__dirname + '/vocalize.js');

global.log = console;
global.parameters = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
global.secrets = JSON.parse(fs.readFileSync('secret.json', 'utf-8'));

const rateFilm = queryString => crawler.searchFilm(queryString).then(film => {
    return film ? vocalize.vocalizeFilm(film) : vocalize.vocalizeFilmNotFound(queryString);
});

module.exports = {
    rateFilm: rateFilm
};