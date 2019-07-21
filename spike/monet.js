const { Right, Left, Maybe } = require('monet");

const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use(maybeChai({
  match: (maybe, cases) => maybe.cata(cases.Nothing, cases.Just),
  isMaybe: obj => Maybe.isOfType(obj),
}));


describe("Secure rating extraction using Monet", () => {

  // System under test
  const Try = callback => {
    try {
      const result = callback();
      return result ? Right(result) : Left(new Error('Undefined'));
    } catch (e) {
      return Left(e);
    }
  };

  const extractVotes = movie =>
    Try(() => movie.pagemap.moviereview[0].rating)
      .toMaybe()
      .map(parseInt)
      .filterNot(isNaN);

  it('root node is wrong', () => {
    const movie = { wrong: { moviereview: [ { rating: 5 } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

  it('list node is empty', () => {
    const movie = { pagemap: { moviereview: [] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

  it('leaf node is wrong', () => {
    const movie = { pagemap: { moviereview: [ { wrong: 5 } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

  it('leaf node is number', () => {
    const movie = { pagemap: { moviereview: [ { rating: 5 } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.just(5);
  });

  it('leaf node is valid string', () => {
    const movie = { pagemap: { moviereview: [ { rating: "5" } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.just(5);
  });

  it('leaf node is invalid string', () => {
    const movie = { pagemap: { moviereview: [ { rating: "a" } ] } };
    const result = extractVotes(movie);
    expect(result).to.be.nothing();
  });

});
