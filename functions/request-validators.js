const hasRequiredFields = (body, ...fields) => {
  for (field of fields) {
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

const isRatingValid = (rating) => {
  return req.body.rating < 1 || req.body.rating > 5;
}

module.exports = {
  hasRequiredFields,
  isValueLessThanMax,
  isValueGreaterThanMin,
  isValueBetween
}
