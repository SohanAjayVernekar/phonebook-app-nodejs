function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function requiredText(value, message) {
  if (typeof value !== 'string' || !value.trim()) fail(400, message);
  return value.trim();
}

module.exports = { fail, requiredText };
