const deindent = require('deindent');
const number = require(__dirname + '/number.js');

const vocalizeMovieNotFound = query => {
  const speech = `<speak>Lo siento, no he podido encontrar la película "${query}"</speak>`;
  global.log.info("[VOCALIZER]", speech);
  return speech;
};

const vocalizeMovie = movie => {
  const speech = deindent(`
        <speak>
            ${vocalizeRating(movie)}${vocalizeNumRating(movie)} en <lang xml:lang="en-US">filmaffinity</lang>,
            para ${vocalizeTitle(movie)}${vocalizeYear(movie)}.
        </speak>`);
  global.log.info("[VOCALIZER]", speech);
  return speech;
};

const vocalizeTitle = movie => {
  return `"${movie.title.replace(/[.:]/, ',')}"`;
};

const vocalizeYear = movie => {
  if (movie.year === null)
    return '';
  return `, de <say-as interpret-as="cardinal">${movie.year}</say-as>`;
};

const vocalizeRating = movie => {
  if (movie.rating === null)
    return 'No está disponible';
  const replace = movie.rating.toLocaleString('ES');
  return `<say-as interpret-as="cardinal">${replace}</say-as>`;
};

const vocalizeNumRating = movie => {
  if (movie.numRatings === null)
    return '';
  const roundedNumber = number.zeroNonSignificantFigures(String(movie.numRatings));
  return ` con <say-as interpret-as="cardinal">${roundedNumber}</say-as> votos`;
};

module.exports = {
  vocalizeMovie: vocalizeMovie,
  vocalizeNoMovieFound: vocalizeMovieNotFound,
};
