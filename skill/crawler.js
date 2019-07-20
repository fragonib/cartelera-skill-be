const S = require("sanctuary");
const $ = require("sanctuary-def");
const rp = require('request-promise');
const useragent = require('random-useragent');
const resolveTemplate = require('es6-template-render');
const {UriBuilder} = require('uribuilder');


const searchMovie = movieQuery => {

  global.log.info('[CRAWLER] Search query: ' + movieQuery);

  const movieRequest = buildMovieSearchRequest(movieQuery);
  global.log.info('[HTTP] GET ' + movieRequest.uri);

  return rp(movieRequest)
    .then(response => {

      global.log.info('[CRAWLER] Extracting candidates from response');
      const optionalListOfCandidates = extractCandidates(response);
      const candidateNumber = S.fromMaybe ([]) (optionalListOfCandidates).length;
      global.log.info('[CRAWLER] Found (%s) movie candidates', candidateNumber);

      const optionalSelectedCandidate = S.chain (selectCandidate) (optionalListOfCandidates);
      const optionalMovie = S.chain (extractMovieInfo) (optionalSelectedCandidate);
      global.log.info('[CRAWLER] Selected movie:', optionalMovie);

      return optionalMovie;

    })
    .catch(error => {

      global.log.error('[HTTP] Some error happened with request: ', error);
      if (error.statusCode) {
        global.log.error('[HTTP] Response code: ' + error.statusCode + "\n");
      }

      const noMovie = S.Nothing;
      return noMovie;

    });
};

const buildMovieSearchRequest = movieQuery => {
  const baseUri = resolveTemplate(global.config.movie_review_source_url, global.secrets.google_customsearch_api);
  const targetUri = UriBuilder.updateQuery(baseUri, {q: movieQuery});
  const timeout = global.config.source_timeout_in_millis;
  return {
    method: 'GET',
    uri: targetUri,
    headers: {'User-Agent': useragent.getRandom()},
    timeout: timeout,
    json: true
  }
};

const extractCandidates = response => {
  const itemHasMovieLink = S.pipe([
    S.gets (S.is ($.String)) (['link']),
    S.map (S.test (/film\d{4,8}\.html/)),
    S.fromMaybe (false)
  ]);
  const extractCandidates = S.pipe([
    S.gets(S.is ($.Array ($.Object))) (['items']),
    S.map (S.filter (itemHasMovieLink)),
  ]);
  return extractCandidates(response);
};

const selectCandidate = candidates => S.head(candidates);

const extractMovieInfo = candidate => {
  const extractedMovie = {
    title: S.maybeToNullable (movieValueExtractor ('title') (candidate)),
    year: S.maybeToNullable (movieValueExtractor ('year') (candidate)),
    rating: S.maybeToNullable (movieValueExtractor ('rating') (candidate)),
    numRatings: S.maybeToNullable (movieValueExtractor ('numRatings') (candidate)),
  };
  return (extractedMovie.title === null || extractedMovie.rating === null) ?
    S.Nothing : S.Just(extractedMovie);
};

const movieValueExtractor = name => {

  const or = (...fns) => a => fns.reduce((r, f) => r || f(a), false);
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
      const voidExtractor = movie => S.Nothing;
      return voidExtractor;
  }

};


module.exports = {
  searchMovie: searchMovie
};
