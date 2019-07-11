const S = require("sanctuary");
const $ = require("sanctuary-def");
const rp = require('request-promise');
const useragent = require('random-useragent');
const interpolate = require('es6-template-render');
const {UriBuilder} = require('uribuilder');
const {or, iff} = require(__dirname + '/utils.js');


const searchFilm = function (filmQuery) {

  global.log.info('[SEARCH] ' + filmQuery);

  const filmRequest = buildFilmSearchRequest(filmQuery);
  global.log.info('[HTTP] GET ' + filmRequest.uri);

  return rp(filmRequest)
    .then(function (body) {

      const searchResults = body.items || [];
      const hasMovieLink = item => item.link.match(/film\d{4,8}\.html/);
      const candidates = searchResults.filter(hasMovieLink);
      global.log.info('[CRAWLER] Candidates (%s)', candidates.length);

      const films = candidates.map(film => ({
        title: S.maybeToNullable(filmValueExtractor('title')(film)),
        year: S.maybeToNullable(filmValueExtractor('year')(film)),
        rating: S.maybeToNullable(filmValueExtractor('rating')(film)),
        numRatings: S.maybeToNullable(filmValueExtractor('numRatings')(film)),
      }));

      const firstFilm = films[0];
      global.log.info('[CRAWLER] First film', firstFilm);

      return firstFilm;

    })
    .catch(function (error) {

      global.log.error('Some error happened with request: ', error);
      if (response && response.statusCode) {
        global.log.error(response.statusCode + "\n");
      }

    });
};

const buildFilmSearchRequest = function (filmQuery) {
  const baseUri = interpolate(global.parameters.movie_review_source_url, global.secrets.google_customsearch_api);
  const targetUri = UriBuilder.updateQuery(baseUri, {q: filmQuery});
  const timeout = global.parameters.source_timeout_in_millis;
  return {
    method: 'GET',
    json: true,
    uri: targetUri,
    timeout: timeout,
    headers: {'User-Agent': useragent.getRandom()}
  }
};

const filmValueExtractor = function (field) {
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
      return () => Maybe.Nothing;
  }
};


module.exports = {
  searchFilm: searchFilm
};
