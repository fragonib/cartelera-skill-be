// Import Sanctuary
const S = require("sanctuary");
const type = require('sanctuary-type-identifiers');

// Configure chai to deal with Sanctuary maybes
const chai = require('chai');
const expect = chai.expect;
const maybeChai = require('maybe-chai');
chai.use( maybeChai( {
  match: (maybe, cases) => S.maybe_ (cases.Nothing) (cases.Just) (maybe),
  isMaybe: obj => type.parse( type( obj ) ).name === 'Maybe',
} ) );

// Using rewire to get into Crawler private resources
const rewire = require('rewire');
const userRewire = rewire('../skill/crawler');
const extractCandidates = userRewire.__get__('extractCandidates');
const extractMovieInfo = userRewire.__get__('extractMovieInfo');


describe("Extract candidates from response", () => {

  it('No items', () => {
    const response = {
      wrong: [
        { link: 'http://a.b.c/film349394.html', other: 'any value' }
      ]
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.nothing;
  });

  it('No well formed items', () => {
    const response = {
      items: { link: 'http://a.b.c/film349394.html', other: 'any value' }
    };
    const candidates = extractCandidates(response);
    expect(candidates).to.be.nothing;
  });

  it('Items well formed, but empty', () => {
    const response = {
      items: []
    };
    const candidates = extractCandidates(response);
    expect(S.maybeToNullable(candidates)).to.be.eql([]);
  });

  it('Items well formed, but any is a candidate', () => {
    const response = {
      items: [
        { link: 'wrong', other: 'any value' } ,
        { other: 'any value' }
      ]
    };
    const candidates = extractCandidates(response);
    expect(S.maybeToNullable(candidates)).to.be.eql([]);
  });

  it('Items well formed with few candidates', () => {
    const response = {
      items: [
        { link: 'http://a.b.c/film349394.html', other: 'any value' },
        { link: 'ooo', other: 'any value' } ,
        { other: 'any value' }
      ]
    };
    const candidates = extractCandidates(response);
    expect(S.maybeToNullable(candidates)).to.be.eql([
        { link: 'http://a.b.c/film349394.html', other: 'any value' }
      ]);
  });

});


describe("Extract movie info from candidate", () => {

  it('Has NO minimum info', () => {
    const candidateItem = {
      pagemap: {
        movie: [
          {
            name: 'Matrix'
          }
        ]
      }
    };
    const movieInfo = extractMovieInfo(candidateItem);
    expect(movieInfo).to.be.nothing();
  });

  it('Has invalid info', () => {
    const candidateItem = {
      pagemap: {
        movie: [
          {
            name: 'Matrix',
            datepublished: 'wrong'
          }
        ],
        moviereview: [
          {
            originalrating: 5,
            votes: 'wrong'
          }
        ]
      }
    };
    const movieInfo = extractMovieInfo(candidateItem);
    expect(S.fromMaybe ({}) (movieInfo)).to.be.eql({
      title: 'Matrix',
      year: null,
      rating: 5,
      numRatings: null
    });
  });

  it('Has minimum info', () => {
    const candidateItem = {
      pagemap: {
        movie: [
          {
            name: 'Matrix'
          }
        ],
        moviereview: [
          {
            originalrating: 5
          }
        ]
      }
    };
    const movieInfo = extractMovieInfo(candidateItem);
    expect(S.fromMaybe ({}) (movieInfo)).to.be.eql({
      title: 'Matrix',
      year: null,
      rating: 5,
      numRatings: null
    });
  });

  it('Has full info', () => {
    const candidateItem = {
      pagemap: {
        movie: [
          {
            name: 'Matrix',
            datepublished: 2009
          }
        ],
        moviereview: [
          {
            originalrating: 5,
            votes: 1000
          }
        ]
      }
    };
    const movieInfo = extractMovieInfo(candidateItem);
    expect(S.fromMaybe ({}) (movieInfo)).to.be.eql({
      title: 'Matrix',
      year: 2009,
      rating: 5,
      numRatings: 1000
    });
  });

});

