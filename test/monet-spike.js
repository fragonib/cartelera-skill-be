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

  const extractVotes = film =>
    Try(() => film.pagemap.moviereview[0].votes)
      .toMaybe()
      .map(parseInt)
      .filterNot(isNaN);

  it('root node is wrong', function() {
    const film = { wrong: { moviereview: [ { votes: 5 } ] } };
    const result = extractVotes(film);
    expect(result).to.be.nothing();
  });

  it('list node is empty', function() {
    const film = { pagemap: { moviereview: [] } };
    const result = extractVotes(film);
    expect(result).to.be.nothing();
  });

  it('leaf node is wrong', function() {
    const film = { pagemap: { moviereview: [ { wrong: 5 } ] } };
    const result = extractVotes(film);
    expect(result).to.be.nothing();
  });

  it('leaf node is number', function() {
    const film = { pagemap: { moviereview: [ { votes: 5 } ] } };
    const result = extractVotes(film);
    expect(result).to.be.just(5);
  });

  it('leaf node is valid string', function() {
    const film = { pagemap: { moviereview: [ { votes: "5" } ] } };
    const result = extractVotes(film);
    expect(result).to.be.just(5);
  });

  it('leaf node is invalid string', function() {
    const film = { pagemap: { moviereview: [ { votes: "a" } ] } };
    const result = extractVotes(film);
    expect(result).to.be.nothing();
  });

});
