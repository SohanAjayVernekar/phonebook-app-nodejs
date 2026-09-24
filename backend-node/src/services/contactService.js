const contactModel = require('../models/contactModel');
const { contactDto } = require('../utils/dto');
const { fail } = require('../utils/errors');
const { CATEGORIES, validateContact, validateCategories } = require('../utils/validation');

async function list(userId, query) {
  const page = Number(query.page || 1);
  const size = Number(query.page_size || 8);
  const sort = query.sort || 'newest';
  if (page < 1) fail(400, 'Page number must be at least 1');
  if (size < 1 || size > 100) fail(400, 'Page size must be between 1 and 100');
  if (!['newest', 'oldest', 'name_asc', 'name_desc'].includes(sort)) fail(400, 'sort must be one of newest, oldest, name_asc, name_desc');

  let categories = [];
  if (query.category) categories.push(query.category.toUpperCase());
  if (query.categories) categories.push(...query.categories.split(',').map(x => x.trim().toUpperCase()).filter(Boolean));
  categories = [...new Set(categories)];
  validateCategories(categories);

  let hasEmail = null;
  if (query.has_email != null) {
    if (!['true', 'false'].includes(query.has_email)) fail(400, 'has_email must be true or false');
    hasEmail = query.has_email === 'true';
  }

  const result = await contactModel.search(userId, {
    page, size, sort,
    searchText: query.search?.trim() || '',
    categories,
    hasEmail,
    dateFrom: query.date_from || null,
    dateTo: query.date_to || null
  });

  return {
    items: result.rows.map(contactDto),
    total: result.total,
    page: result.page,
    page_size: result.size,
    total_pages: result.totalPages,
    category: query.category || null,
    sort
  };
}

async function get(userId, id) {
  const contact = await contactModel.findById(id, userId);
  if (!contact) fail(404, 'Contact not found');
  return contactDto(contact);
}

async function create(userId, body) {
  return contactDto(await contactModel.create(userId, await validateContact(body, require('../config/database').pool)));
}

async function update(userId, id, body) {
  if (!await contactModel.findById(id, userId)) fail(404, 'Contact not found');
  return contactDto(await contactModel.update(id, await validateContact(body, require('../config/database').pool, Number(id))));
}

async function remove(userId, id) {
  const deleted = await contactModel.remove(id, userId);
  if (!deleted) fail(404, 'Contact not found');
  return { message: 'Contact deleted successfully', id: Number(id) };
}

async function bulkRemove(userId, ids) {
  if (!Array.isArray(ids) || !ids.length) fail(400, 'Provide at least one contact id');
  if (ids.length > 100) fail(400, 'You can delete at most 100 contacts at once');
  return { deleted: await contactModel.bulkRemove(userId, ids) };
}

module.exports = { list, get, create, update, remove, bulkRemove, CATEGORIES };
