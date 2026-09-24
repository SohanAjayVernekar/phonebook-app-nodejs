const argon2 = require('argon2');
const userModel = require('../models/userModel');
const { createToken } = require('../utils/jwt');
const { userDto } = require('../utils/dto');
const { fail, requiredText } = require('../utils/errors');
const { EMAIL_REGEX } = require('../utils/validation');

async function register(body) {
  const name = requiredText(body.name, 'must not be blank');
  const email = requiredText(body.email, 'must not be blank').toLowerCase();
  const password = requiredText(body.password, 'must not be blank');
  if (!EMAIL_REGEX.test(email)) fail(400, 'must be a well-formed email address');
  if (name.length < 2 || name.length > 255) fail(400, 'size must be between 2 and 255');
  if (password.length < 8 || password.length > 128) fail(400, 'size must be between 8 and 128');
  if (await userModel.findByEmail(email)) fail(409, 'Email is already registered');

  const user = await userModel.createUser(name, email, await argon2.hash(password));
  return { access_token: createToken(user.id), token_type: 'bearer', user: userDto(user) };
}

async function login(body) {
  const email = requiredText(body.email, 'must not be blank').toLowerCase();
  const password = requiredText(body.password, 'must not be blank');
  const user = await userModel.findByEmail(email);
  if (!user || !user.password_hash || !(await argon2.verify(user.password_hash, password))) {
    fail(401, 'Invalid email or password');
  }
  return { access_token: createToken(user.id), token_type: 'bearer', user: userDto(user) };
}

async function updateProfile(userId, body) {
  const name = requiredText(body.name, 'Name is required');
  if (name.length < 2 || name.length > 255) fail(400, 'Name must be between 2 and 255 characters');
  return userDto(await userModel.updateName(userId, name));
}

async function changePassword(user, body) {
  const current = requiredText(body.current_password, 'Current password is required');
  if (!user.password_hash || !(await argon2.verify(user.password_hash, current))) fail(400, 'Current password is incorrect');
  const next = requiredText(body.new_password, 'New password is required');
  if (next.length < 8 || next.length > 128) fail(400, 'Password must be between 8 and 128 characters');
  if (await argon2.verify(user.password_hash, next)) fail(400, 'New password must be different from the current one');
  await userModel.updatePassword(user.id, await argon2.hash(next));
}

module.exports = { register, login, updateProfile, changePassword };
