const S = require("sanctuary");
const $ = require("sanctuary-def");
const type = require('sanctuary-type-identifiers');

const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use(maybeChai({
  match: (maybe, cases) => S.maybe_(cases.Nothing)(cases.Just)(maybe),
  isMaybe: obj => type.parse(type(obj)).name === 'Maybe',
}));


describe("Sanctuary spike", function() {

  // System under test
  const or = (...fns) => a => fns.reduce((r, f) => r || f(a), false);
  const iff = cond => f => a => cond(a) ? f(a) : S.Just(a);
  const isStringOrNumber = or(S.is($.String), S.is($.Number));
  const extractVotes = S.pipe([
    S.gets(isStringOrNumber)(['pagemap', 'moviereview', '0', 'votes']),
    S.chain(iff(S.is($.String))(S.parseInt(10))),
  ]);


  it('root node is wrong', function() {
    const film = { wrong: { moviereview: [ { votes: 5 } ] } };
    const result = extractVotes(film);
    expect(result).to.be.nothing();
  });

  it('list node is empty', function() {
    const film = { pagemap: { moviereview: {} } };
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
