const chai = require('chai');
const expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const chaiXml = require('chai-xml');
chai.use(chaiXml);

const deindent = require('deindent');


describe("Movie rater", function() {

    const rater = require(__dirname + '/../skill/ranker.js');

    it('should vocalize a full movie review', function() {

        const movieName = 'matrix';

        const result = rater.rateMovie(movieName);

        return result.then(function(speech) {
            expect(speech).xml.to.equal(deindent(`
                <speak>
                    <say-as interpret-as="cardinal">7,9</say-as> con <say-as interpret-as="cardinal">193000</say-as> votos en <lang xml:lang="en-US">filmaffinity</lang>,
                    para "Matrix", de <say-as interpret-as="cardinal">1999</say-as>.
                </speak>
            `));
        });

    });

    it('should vocalize movie doesnt exist', function() {

        const movieName = 'unexistent movie';

        const result = rater.rateMovie(movieName);

        return result.then(function(speech) {
            expect(speech).xml.to.equal(
              `<speak>Lo siento, no he podido encontrar la película "unexistent movie"</speak>`
            );
        });

    });

});
