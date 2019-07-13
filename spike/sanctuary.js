const S = require("sanctuary");
const $ = require("sanctuary-def");
const type = require('sanctuary-type-identifiers');
const {or, iff} = require(__dirname + '/../skill/utils.js');

const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use(maybeChai({
  match: (maybe, cases) => S.maybe_(cases.Nothing)(cases.Just)(maybe),
  isMaybe: obj => type.parse(type(obj)).name === 'Maybe',
}));


describe("Sanctuary spike", function() {

  // System under test
  const extractVotes = S.pipe([
    S.gets (or (S.is($.String), S.is($.Number))) (['pagemap', 'moviereview', '0', 'votes']),
    S.chain (S.ifElse (S.is($.String)) (S.parseInt(10)) (S.Just)),
  ]);


  it('root node is wrong', function() {
    const movie = { wrong: { moviereview: [ { votes: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

  it('list node is empty', function() {
    const movie = { pagemap: { moviereview: {} } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

  it('leaf node is wrong', function() {
    const movie = { pagemap: { moviereview: [ { wrong: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

  it('leaf node is number', function() {
    const movie = { pagemap: { moviereview: [ { votes: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.just(5);
  });

  it('leaf node is valid string', function() {
    const movie = { pagemap: { moviereview: [ { votes: "5" } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.just(5);
  });

  it('leaf node is invalid string', function() {
    const movie = { pagemap: { moviereview: [ { votes: "a" } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

});
