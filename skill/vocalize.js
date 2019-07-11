const deindent = require('deindent');

const vocalizeMovieNotFound = function(query) {
    const speech = `<speak>Lo siento, no he podido encontrar la película "${query}"</speak>`;
    global.log.info("[VOCALIZER]", speech);
    return speech;
};

const vocalizeMovie = function(movie) {
    const speech = deindent(`
        <speak>
            ${vocalizeRating(movie)}${vocalizeNumRating(movie)} en <lang xml:lang="en-US">filmaffinity</lang>,
            para ${vocalizeTitle(movie)}${vocalizeYear(movie)}.
        </speak>`);
    global.log.info("[VOCALIZER]", speech);
    return speech;
};

const vocalizeTitle = function(movie) {
    return `"${movie.title.replace(/[.:]/, ',')}"`;
};

const vocalizeYear = function(movie) {
    if (movie.year === null)
        return '';
    return `, de <say-as interpret-as="cardinal">${movie.year}</say-as>`;
};

const vocalizeRating = function(movie) {
    if (movie.rating === null)
        return 'No está disponible';
    let replace = movie.rating.toLocaleString('ES');
    return `<say-as interpret-as="cardinal">${replace}</say-as>`;
};

const vocalizeNumRating = function(movie) {

    if (movie.numRatings === null)
        return '';

    const numberString = String(movie.numRatings);
    const numberLength = numberString.length;
    const bigNumberLength = [ 0, 4, 6 ];
    const bigNumUnit = [ 0, 2, 3 ];

    let thresholdLength;
    for (let i = 0; i < bigNumberLength.length; i++) {
        const _length = bigNumberLength[i];
        if (numberLength >= _length) {
            thresholdLength = _length;
        }
    }
    const roundPositions = bigNumUnit[bigNumberLength.indexOf(thresholdLength)];
    const head = roundPositions > 0 ? numberString.slice(0, -1 * roundPositions) : numberString;
    const tail = '0'.repeat(roundPositions);

    return ` con <say-as interpret-as="cardinal">${head}${tail}</say-as> votos`;
};

module.exports = {
    vocalizeMovie : vocalizeMovie,
    vocalizeNoMovieFound : vocalizeMovieNotFound,
};
