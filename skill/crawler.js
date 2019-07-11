const S = require("sanctuary");
const $ = require("sanctuary-def");
const rp = require('request-promise');
const useragent = require('random-useragent');
const resolveTemplate = require('es6-template-render');
const {UriBuilder} = require('uribuilder');
const {or, iff} = require(__dirname + '/utils.js');


const searchMovie = function (movieQuery) {

  global.log.info('[SEARCH] ' + movieQuery);

  const movieRequest = buildMovieSearchRequest(movieQuery);
  global.log.info('[HTTP] GET ' + movieRequest.uri);

  return rp(movieRequest)
    .then(function (body) {

      const searchResults = body.items || [];
      const hasMovieLink = item => item.link.match(/film\d{4,8}\.html/);
      const candidates = searchResults.filter(hasMovieLink);
      global.log.info('[CRAWLER] Candidates (%s)', candidates.length);

      const movies = candidates.map(movie => ({
        title: S.maybeToNullable(movieValueExtractor('title')(movie)),
        year: S.maybeToNullable(movieValueExtractor('year')(movie)),
        rating: S.maybeToNullable(movieValueExtractor('rating')(movie)),
        numRatings: S.maybeToNullable(movieValueExtractor('numRatings')(movie)),
      }));

      const firstMovie = movies[0];
      global.log.info('[CRAWLER] First movie', firstMovie);

      return firstMovie;

    })
    .catch(function (error) {

      global.log.error('Some error happened with request: ', error);
      if (response && response.statusCode) {
        global.log.error(response.statusCode + "\n");
      }

      return error;

    });
};

const buildMovieSearchRequest = function (movieQuery) {
  const baseUri = resolveTemplate(global.parameters.movie_review_source_url, global.secrets.google_customsearch_api);
  const targetUri = UriBuilder.updateQuery(baseUri, {q: movieQuery});
  const timeout = global.parameters.source_timeout_in_millis;
  return {
    method: 'GET',
    json: true,
    uri: targetUri,
    timeout: timeout,
    headers: {'User-Agent': useragent.getRandom()}
  }
};

const movieValueExtractor = function (field) {
  switch (field) {
    case "title":
      return S.pipe([
        S.gets(S.is($.String))(['pagemap', 'movie', '0', 'name'])
      ]);
    case "year":
      return S.pipe([
        S.gets(or(S.is($.String), S.is($.Number)))(['pagemap', 'movie', '0', 'datepublished']),
        S.chain(iff(S.is($.String))(S.parseInt(10))),
      ]);
    case "rating":
      const parseFloat = S.pipe([rating => rating.replace(',', '.'), S.parseFloat]);
      return S.pipe([
        S.gets(or(S.is($.String), S.is($.Number)))(['pagemap', 'moviereview', '0', 'originalrating']),
        S.chain(iff(S.is($.String))(parseFloat)),
      ]);
    case "numRatings":
      return S.pipe([
        S.gets(or(S.is($.String), S.is($.Number)))(['pagemap', 'moviereview', '0', 'votes']),
        S.chain(iff(S.is($.String))(S.parseInt(10))),
      ]);
    default:
      const voidExtractor = () => Maybe.Nothing;
      return voidExtractor;
  }
};


module.exports = {
  searchMovie: searchMovie
};
