// Import Sanctuary
const S = require("sanctuary");
const type = require('sanctuary-type-identifiers');

// Configure chai to deal with Sanctuary maybes
const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use(maybeChai({
  match: (maybe, cases) => S.maybe_(cases.Nothing)(cases.Just)(maybe),
  isMaybe: obj => type.parse(type(obj)).name === 'Maybe',
}));

// Using rewire to get into Crawler private resources
const rewire = require('rewire');
const userRewire = rewire('../skill/crawler');
const extractCandidates = userRewire.__get__('extractCandidates');


describe("Crawler extract candidates", () => {

  it('No items response', () => {
    const response = {
      wrong: [
        { link: 'http://a.b.c/film349394.html', other: 'any value' }
      ]
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.eql([]);
  });

  it('No well formed items', () => {
    const response = {
      items: { link: 'http://a.b.c/film349394.html', other: 'any value' }
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.eql([]);
  });

  it('Items wel formed but empty', () => {
    const response = {
      items: []
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.eql([]);
  });

  it('No candidates', () => {
    const response = {
      items: [
        { link: 'wrong', other: 'any value' } ,
        { other: 'any value' }
      ]
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.eql([]);
  });

  it('Few candidates', () => {
    const response = {
      items: [
        { link: 'http://a.b.c/film349394.html', other: 'any value' },
        { link: 'ooo', other: 'any value' } ,
        { other: 'any value' }
      ]
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.eql([
        { link: 'http://a.b.c/film349394.html', other: 'any value' }
      ]);
  });

});
