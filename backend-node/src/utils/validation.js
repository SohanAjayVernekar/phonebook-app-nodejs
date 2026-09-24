const { fail } = require('./errors');

const CATEGORIES = new Set(['WORK', 'FAMILY', 'FRIEND']);
const PHONE_REGEX = /^\+?[1-9]\d{6,19}$/;
const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;

function validateContact(body, pool, id = null) {
  return (async () => {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 255) {
      fail(400, 'size must be between 0 and 255');
    }
    if (typeof body.phone_number !== 'string' || body.phone_number.length < 7 || body.phone_number.length > 20) {
      fail(400, 'size must be between 7 and 20');
    }

    const phone = body.phone_number.trim();
    if (!PHONE_REGEX.test(phone)) fail(400, 'Phone number must contain 7-20 digits and may start with +');

    const email = body.email == null || !String(body.email).trim() ? null : String(body.email).trim();
    if (email && !EMAIL_REGEX.test(email)) fail(400, 'must be a well-formed email address');

    const category = (body.category || 'FRIEND').toUpperCase();
    if (!CATEGORIES.has(category)) fail(400, 'Category must be WORK, FAMILY, or FRIEND');

    let result = id
      ? await pool.query('SELECT 1 FROM contacts WHERE phone_number=$1 AND id<>$2', [phone, id])
      : await pool.query('SELECT 1 FROM contacts WHERE phone_number=$1', [phone]);
    if (result.rowCount) fail(409, 'Phone number is already in use');

    if (email) {
      result = id
        ? await pool.query('SELECT 1 FROM contacts WHERE email=$1 AND id<>$2', [email, id])
        : await pool.query('SELECT 1 FROM contacts WHERE email=$1', [email]);
      if (result.rowCount) fail(409, 'Email address is already in use');
    }

    return {
      name: body.name.trim(),
      phone,
      email,
      address: body.address ?? null,
      category
    };
  })();
}

function validateCategories(values) {
  for (const category of values) {
    if (!CATEGORIES.has(category)) fail(400, 'Category must be WORK, FAMILY, or FRIEND');
  }
}

module.exports = { CATEGORIES, EMAIL_REGEX, validateContact, validateCategories };
