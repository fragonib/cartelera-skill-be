function insignificantFigures(numberLength) {

  const figuresCountLowerThreshold = [0, 4, 6];
  const figuresToRemove = [0, 2, 3];

  let thresholdLength;
  for (let i = 0; i < figuresCountLowerThreshold.length; i++) {
    const figuresThreshold = figuresCountLowerThreshold[i];
    if (numberLength >= figuresThreshold) {
      thresholdLength = figuresThreshold;
    }
  }

  return figuresToRemove[figuresCountLowerThreshold.indexOf(thresholdLength)];

}

const onlySignificantFigures = numberString => {
  const tailFiguresToRemove = insignificantFigures(numberString.length);
  const head = tailFiguresToRemove > 0 ? numberString.slice(0, -1 * tailFiguresToRemove) : numberString;
  const tail = '0'.repeat(tailFiguresToRemove);
  return head + tail;
};

module.exports = {
  onlySignificantFigures: onlySignificantFigures
};
