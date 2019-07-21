const S = require('sanctuary');
const $ = require('sanctuary-def');
const type = require('sanctuary-type-identifiers');

const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use(maybeChai({
  match: (maybe, cases) => S.maybe_(cases.Nothing)(cases.Just)(maybe),
  isMaybe: obj => type.parse(type(obj)).name === 'Maybe',
}));


describe("Secure rating extraction using Sanctuary", () => {

  // System under test
  const or = (...fns) => a => fns.reduce((r, f) => r || f(a), false);
  const extractVotes = S.pipe([
    S.gets (or (S.is($.String), S.is($.Number))) (['pagemap', 'moviereview', '0', 'rating']),
    S.chain (S.ifElse (S.is($.String)) (S.parseInt(10)) (S.Just)),
  ]);

  // Tests
  it('happy path', () =>  {
    const movie = { pagemap: { moviereview: [ { rating: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.just(5);
  });

  it('root node is not present', () =>  {
    const movie = { wrong: { moviereview: [ { rating: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

  it('list node is not present', () =>  {
    const movie = { pagemap: { moviereview: {} } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

  it('leaf node is not present', () =>  {
    const movie = { pagemap: { moviereview: [ { wrong: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

  it('leaf node is valid numerical string', () =>  {
    const movie = { pagemap: { moviereview: [ { rating: "5" } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.just(5);
  });

  it('leaf node is invalid numerical string', () =>  {
    const movie = { pagemap: { moviereview: [ { rating: "a" } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.nothing();
  });

});
