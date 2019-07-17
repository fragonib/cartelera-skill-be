const chai = require('chai');
const expect = chai.expect;

describe("Number significant figures", function() {

  const number = require(__dirname + '/../skill/number.js');

  it('no figures', function() {
    const numberLiteral = '';
    const result = number.onlySignificantFigures(numberLiteral);
    expect(result).to.be.equal('');
  });

  it('less than 4', function() {
    const numberLiteral = '123';
    const result = number.onlySignificantFigures(numberLiteral);
    expect(result).to.be.equal('123');
  });

  it('less than 6', function() {
    const numberLiteral = '12345';
    const result = number.onlySignificantFigures(numberLiteral);
    expect(result).to.be.equal('12300');
  });

  it('6 or more', function() {
    const numberLiteral = '123456';
    const result = number.onlySignificantFigures(numberLiteral);
    expect(result).to.be.equal('123000');
  });

});
