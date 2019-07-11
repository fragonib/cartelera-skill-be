const { Right, Left, Maybe } = require("monet");

const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use(maybeChai({
  match: (maybe, cases) => maybe.cata(cases.Nothing, cases.Just),
  isMaybe: obj => Maybe.isOfType(obj),
}));


describe("Monet spike", function() {

  const Try = callback => {
    try {
      const result = callback();
      return result ? Right(result) : Left(new Error('Undefined'));
    } catch (e) {
      return Left(e);
    }
  };

  const extractVotes = movie =>
    Try(() => movie.pagemap.moviereview[0].votes)
      .toMaybe()
      .map(parseInt)
      .filterNot(isNaN);

  it('root node is wrong', function() {
    const movie = { wrong: { moviereview: [ { votes: 5 } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

  it('list node is empty', function() {
    const movie = { pagemap: { moviereview: [] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

  it('leaf node is wrong', function() {
    const movie = { pagemap: { moviereview: [ { wrong: 5 } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

  it('leaf node is number', function() {
    const movie = { pagemap: { moviereview: [ { votes: 5 } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.just(5);
  });

  it('leaf node is valid string', function() {
    const movie = { pagemap: { moviereview: [ { votes: "5" } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.just(5);
  });

  it('leaf node is invalid string', function() {
    const movie = { pagemap: { moviereview: [ { votes: "a" } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

});
