const chai = require('chai');
const expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const chaiXml = require('chai-xml');
chai.use(chaiXml);

const deindent = require('deindent');


describe("Movie rater", function() {

    const rater = require(__dirname + '/../skill/rater.js');

    it('should resolve a movie with all review informed', function() {

        const filmName = 'matrix';

        const result = rater.rateFilm(filmName);

        const expectedSpeech = deindent(`
            <speak>
                <say-as interpret-as="cardinal">7,9</say-as> con <say-as interpret-as="cardinal">193000</say-as> votos en <lang xml:lang="en-US">filmaffinity</lang>,
                para "Matrix", de <say-as interpret-as="cardinal">1999</say-as>.
            </speak>
            `);
        return result.then(function(value) {
            expect(value).xml.to.equal(expectedSpeech);
        });

    });

    it('should inform when film doesnt exist', function() {

        const filmName = 'unexistent movie';

        const result = rater.rateFilm(filmName);

        const expectedSpeech = `<speak>Lo siento, no he podido encontrar la película "unexistent movie"</speak>`;
        return result.then(function(value) {
            expect(value).xml.to.equal(expectedSpeech);
        });

    });

});
