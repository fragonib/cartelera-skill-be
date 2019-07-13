const S = require("sanctuary");
const $ = require("sanctuary-def");
const rp = require('request-promise');
const useragent = require('random-useragent');
const resolveTemplate = require('es6-template-render');
const {UriBuilder} = require('uribuilder');
const {or} = require(__dirname + '/utils.js');


const buildMovieSearchRequest = movieQuery => {
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

const searchMovie = movieQuery => {

  global.log.info('[CRAWLER] Search query: ' + movieQuery);

  const movieRequest = buildMovieSearchRequest(movieQuery);
  global.log.info('[HTTP] GET ' + movieRequest.uri);

  return rp(movieRequest)
    .then(body => {

      const searchResults = body.items || [];
      const hasMovieLink = item => item.link.match(/film\d{4,8}\.html/);
      const candidates = searchResults.filter(hasMovieLink);
      global.log.info('[CRAWLER] Found (%s) movie candidates', candidates.length);

      const movies = candidates.map(movie => ({
        title: S.maybeToNullable (movieValueExtractor ('title') (movie)),
        year: S.maybeToNullable (movieValueExtractor ('year') (movie)),
        rating: S.maybeToNullable (movieValueExtractor ('rating') (movie)),
        numRatings: S.maybeToNullable (movieValueExtractor ('numRatings') (movie)),
      }));

      const firstMovie = S.head(movies);
      global.log.info('[CRAWLER] First movie candidate:', firstMovie);

      return firstMovie;

    })
    .catch(function (error) {

      global.log.error('[HTTP] Some error happened with request: ', error);
      if (error.statusCode) {
        global.log.error('[HTTP] Response code: ' + error.statusCode + "\n");
      }

      return S.Nothing;

    });
};

const movieValueExtractor = name => {

  const isString = S.is ($.String);
  const isStringOrNumber = or (isString, S.is ($.Number));

  switch (name) {

    case "title":
      return S.pipe([
        S.gets (isString) (['pagemap', 'movie', '0', 'name'])
      ]);

    case "year":
      return S.pipe([
        S.gets (isStringOrNumber) (['pagemap', 'movie', '0', 'datepublished']),
        S.chain (S.ifElse (isString) (S.parseInt(10)) (S.Just)),
      ]);

    case "rating":
      const parseRating = S.pipe([rating => rating.replace(',', '.'), S.parseFloat]);
      return S.pipe([
        S.gets (isStringOrNumber) (['pagemap', 'moviereview', '0', 'originalrating']),
        S.chain (S.ifElse (isString) (parseRating) (S.Just)),
      ]);

    case "numRatings":
      return S.pipe([
        S.gets (isStringOrNumber) (['pagemap', 'moviereview', '0', 'votes']),
        S.chain (S.ifElse (isString) (S.parseInt(10)) (S.Just)),
      ]);

    default:
      const voidExtractor = () => S.Nothing;
      return voidExtractor;
  }

};


module.exports = {
  searchMovie: searchMovie
};
