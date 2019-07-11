const deindent = require('deindent');

const vocalizeFilmNotFound = function(query) {
    const speech = `<speak>Lo siento, no he podido encontrar la película "${query}"</speak>`;
    global.log.info("[VOCALIZER]", speech);
    return speech;
};

const vocalizeFilm = function(film) {
    const speech = deindent(`
        <speak>
            ${vocalizeRating(film)}${vocalizeNumRating(film)} en <lang xml:lang="en-US">filmaffinity</lang>,
            para ${vocalizeTitle(film)}${vocalizeYear(film)}.
        </speak>`);
    global.log.info("[VOCALIZER]", speech);
    return speech;
};

const vocalizeTitle = function(film) {
    return `"${film.title.replace(/[.:]/, ',')}"`;
};

const vocalizeYear = function(film) {
    if (film.year === null)
        return '';
    return `, de <say-as interpret-as="cardinal">${film.year}</say-as>`;
};

const vocalizeRating = function(film) {
    if (film.rating === null)
        return 'No está disponible';
    let replace = film.rating.toLocaleString('ES');
    return `<say-as interpret-as="cardinal">${replace}</say-as>`;
};

const vocalizeNumRating = function(film) {

    if (film.numRatings === null)
        return '';

    const numberString = String(film.numRatings);
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
    vocalizeFilm : vocalizeFilm,
    vocalizeFilmNotFound : vocalizeFilmNotFound,
};
