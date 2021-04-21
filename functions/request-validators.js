const hasRequiredFields = (body, ...fields) => {
  for (const field of fields) {
    if (!body.hasOwnProperty(field)) return false;
  }

  return true;
}

const isValueLessThanMax = (value, maxValue) => {
  return value < maxValue;
}

const isValueGreaterThanMin = (value, minValue) => {
  return value > minValue;
}

const isValueBetween = (value, minValue, maxValue) => {
  return isValueGreaterThanMin(value, minValue) && isValueLessThanMax(value, maxValue);
}

module.exports = {
  hasRequiredFields,
  isValueLessThanMax,
  isValueGreaterThanMin,
  isValueBetween
}
