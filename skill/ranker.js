const S = require("sanctuary");
const fs = require('graceful-fs');
const crawler = require(__dirname + '/crawler.js');
const vocalize = require(__dirname + '/vocalize.js');

global.log = console;
global.parameters = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
global.secrets = JSON.parse(fs.readFileSync('secret.json', 'utf-8'));

const rateMovie = titleWords => crawler.searchMovie(titleWords).then(optionalMovie => {
    let vocalizer = S.maybe_(() => vocalize.vocalizeNoMovieFound(titleWords))(vocalize.vocalizeMovie);
    return vocalizer(optionalMovie)
});

module.exports = {
    rateMovie: rateMovie
};