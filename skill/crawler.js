const S = require("sanctuary");
const $ = require("sanctuary-def");
const request = require('request');
const useragent = require('random-useragent');
const interpolate = require('es6-template-render');
const { or, iff } = require(__dirname + '/utils.js')

const buildFilmSearchRequest = function(filmQuery) {
    return {
        method: 'GET',
        json: true,
        uri: interpolate(global.parameters.movie_review_source_url, global.secrets.google_customsearch_api)
          + "&q=" + encodeURIComponent(filmQuery),
        timeout: global.parameters.source_timeout_in_millis,
        headers: {
            'User-Agent': useragent.getRandom()
        }
    }
};

const filmValueExtractor = function(field) {
    switch (field) {
        case "title": return S.pipe([
                S.gets(S.is($.String))(['pagemap', 'movie', '0', 'name'])
            ]);
        case "year": return S.pipe([
                S.gets(or(S.is($.String), S.is($.Number)))(['pagemap', 'movie', '0', 'datepublished']),
                S.chain(iff(S.is($.String))(S.parseInt(10))),
            ]);
        case "rating": return S.pipe([
                S.gets(or(S.is($.String), S.is($.Number)))(['pagemap', 'moviereview', '0', 'originalrating']),
                S.map(rating => rating.replace(',', '.')),
                S.chain(iff(S.is($.String))(S.parseFloat)),
            ]);
        case "numRatings": return S.pipe([
                S.gets(or(S.is($.String), S.is($.Number)))(['pagemap', 'moviereview', '0', 'votes']),
                S.chain(iff(S.is($.String))(S.parseInt(10))),
            ]);
        default:
            return () => Maybe.Nothing;
    }
};

const searchFilm = function(filmQuery, callback) {

    global.log.info('[SEARCH] ' + filmQuery);

    const filmRequest = buildFilmSearchRequest(filmQuery);
    global.log.info('[HTTP] GET ' + filmRequest.uri);

    request.get(filmRequest, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            global.log.error('Some error happened with request: ', error);
            if (response && response.statusCode) {
                global.log.error(response.statusCode + "\n");
            }
            callback(null)
        }
        else {

            let searchResults = body.items || [];
            const candidates = searchResults.filter(item => item.link.match(/film\d{4,8}\.html/));
            global.log.info('[CRAWLER] Candidates (%s)', candidates.length);

            const films = candidates.map(film => ({
                title: S.maybeToNullable(filmValueExtractor('title')(film)),
                year: S.maybeToNullable(filmValueExtractor('year')(film)),
                rating: S.maybeToNullable(filmValueExtractor('rating')(film)),
                numRatings: S.maybeToNullable(filmValueExtractor('numRatings')(film)),
            }));

            const firstFilm = films[0];
            global.log.info('[CRAWLER] First film', firstFilm);
            callback(firstFilm);
        }
    });
};


module.exports = {
    searchFilm: searchFilm
};
