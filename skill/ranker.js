const fs = require('graceful-fs');
const crawler = require(__dirname + '/crawler.js');
const vocalize = require(__dirname + '/vocalize.js');

global.log = console;
global.parameters = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
global.secrets = JSON.parse(fs.readFileSync('secret.json', 'utf-8'));

const rateMovie = queryString => crawler.searchMovie(queryString).then(movie => {
    return movie ? vocalize.vocalizeMovie(movie) : vocalize.vocalizeMovieNotFound(queryString);
});

module.exports = {
    rateMovie: rateMovie
};