const chai = require('chai');
const expect = chai.expect;

describe("To zero non significant figures", function() {

  const number = require(__dirname + '/../skill/number.js');

  it('no figures', function() {
    const numberLiteral = '';
    const result = number.zeroNonSignificantFigures(numberLiteral);
    expect(result).to.be.equal('');
  });

  it('less than 4 figures, shouldnt zero any figure', function() {
    const numberLiteral = '123';
    const result = number.zeroNonSignificantFigures(numberLiteral);
    expect(result).to.be.equal('123');
  });

  it('less than 5 figures, should zero 2 figures', function() {
    const numberLiteral = '1234';
    const result = number.zeroNonSignificantFigures(numberLiteral);
    expect(result).to.be.equal('1200');
  });

  it('5 figures or more, should zero 2 figures', function() {
    const numberLiteral = '123456';
    const result = number.zeroNonSignificantFigures(numberLiteral);
    expect(result).to.be.equal('123000');
  });

});
