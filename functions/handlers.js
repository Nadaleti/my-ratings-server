const handleMissingRequiredFields = () => {
  return { status: 400, message: 'Missing required fields', code: 'REQUIRED_ERROR' };
}

const handleNotFound = (...message) => {
  return { status: 404, message: message.length === 0 ? 'Not found' : message[0], code: 'NOT_FOUND_ERROR' };
}

const handleInvalidRating = () => {
  return { status: 400, message: 'Rating should be between 1 and 5', code: 'INVALID_RATING_ERROR' };
}

const handleFirestoreError = (code) => {
  if (code == 5) {
    return handleNotFound('Document not found');
  }
}

module.exports = {
  handleNotFound,
  handleInvalidRating,
  handleFirestoreError,
  handleMissingRequiredFields
}
