const chai = require('chai');
const expect = chai.expect;

describe("Secure rating extraction using proxies", () => {

  // System under test
  function safe(obj) {
    return new Proxy(obj, {
      get: function(target, name) {
        const result = target[name];
        if (!!result) {
          return (result instanceof Object)? safe(result) : result;
        }
        return safe({});
      }
    });
  }
  const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
  const isType = name => x => typeof x === name;
  const matched = x => ({
    on: () => matched(x),
    otherwise: () => x,
  });
  const match = x => ({
    on: (pred, fn) => (pred(x) ? matched(fn(x)) : match(x)),
    otherwise: fn => fn(x),
  });
  const extractVotes = pipe(
    movie => safe(movie).pagemap.moviereview[0].rating,
    rating => match(rating)
      .on(isType('string'), rating  => parseInt(rating) || null)
      .on(isType('number'), rating  => rating)
      .otherwise(() => null)
  );

  // Tests
  it('happy path', () =>  {
    const movie = { pagemap: { moviereview: [ { rating: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.equal(5);
  });

  it('root node is not present', () =>  {
    const movie = { wrong: { moviereview: [ { rating: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.null;
  });

  it('list node is not present', () =>  {
    const movie = { pagemap: { moviereview: {} } };
    const votes = extractVotes(movie);
    expect(votes).to.be.null;
  });

  it('leaf node is not present', () =>  {
    const movie = { pagemap: { moviereview: [ { wrong: 5 } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.null;
  });

  it('leaf node is valid numerical string', () =>  {
    const movie = { pagemap: { moviereview: [ { rating: "5" } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.equal(5);
  });

  it('leaf node is invalid numerical string', () =>  {
    const movie = { pagemap: { moviereview: [ { rating: "a" } ] } };
    const votes = extractVotes(movie);
    expect(votes).to.be.null;
  });

});
