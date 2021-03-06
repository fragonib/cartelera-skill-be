const S = require('sanctuary');
const fs = require('graceful-fs');
const crawler = require(__dirname + '/crawler.js');
const vocalizer = require(__dirname + '/vocalize.js');

global.log = console;
global.config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf-8'));
global.secrets = JSON.parse(fs.readFileSync(__dirname + '/../secret.json', 'utf-8'));

const rateMovie = queryWords => crawler.searchMovie(queryWords).then(optionalMovie => {
  const noMovieVocalizer = () => vocalizer.vocalizeNoMovieFound(queryWords);
  return S.maybe_ (noMovieVocalizer) (vocalizer.vocalizeMovie) (optionalMovie);
});

module.exports = {
    rateMovie: rateMovie
};
