const insignificantFigures = integerString => {

  const integerLength = integerString.length;

  const closedLowerBoundFiguresNumber = [0, 4, 5];
  const lessSignificantFiguresToRemove = [0, 2, 3];

  let greaterLowerBound;
  for (let i = 0; i < closedLowerBoundFiguresNumber.length; i++)
    if (integerLength >= closedLowerBoundFiguresNumber[i])
      greaterLowerBound = closedLowerBoundFiguresNumber[i];

  const lowerBoundMatch = closedLowerBoundFiguresNumber.indexOf(greaterLowerBound);
  return lessSignificantFiguresToRemove[lowerBoundMatch];

};

const zeroNonSignificantFigures = integerString => {
  const lessSignificantFiguresToRemove = insignificantFigures(integerString);
  const head = lessSignificantFiguresToRemove > 0 ?
    integerString.slice(0, -1 * lessSignificantFiguresToRemove) : integerString;
  const tail = '0'.repeat(lessSignificantFiguresToRemove);
  return head + tail;
};

module.exports = {
  zeroNonSignificantFigures: zeroNonSignificantFigures
};
