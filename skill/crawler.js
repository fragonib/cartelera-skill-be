const request = require('request');
const Try = require('try-monad');
const useragent = require('random-useragent');
const interpolate = require('es6-template-render');

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

const processFilmValue = function(field, film) {
    switch (field) {
        case "title":
            return Try(() => film.pagemap.movie[0].name).orElse(null);
        case "year":
            return Try(() => parseInt(film.pagemap.movie[0].datepublished)).orElse(null);
        case "rating":
            return Try(() => parseFloat(film.pagemap.moviereview[0].originalrating.replace(',', '.'))).orElse(null);
        case "numRatings":
            return Try(() => parseInt(film.pagemap.moviereview[0].votes)).orElse(null);
        default:
            return null;
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
                title: processFilmValue('title', film),
                year: processFilmValue('year', film),
                rating: processFilmValue('rating', film),
                numRatings: processFilmValue('numRatings', film),
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
