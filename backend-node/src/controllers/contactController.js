const contactService = require('../services/contactService');

async function list(req, res, next) { try { res.json(await contactService.list(req.user.id, req.query)); } catch (e) { next(e); } }
async function create(req, res, next) { try { res.status(201).json(await contactService.create(req.user.id, req.body)); } catch (e) { next(e); } }
async function get(req, res, next) { try { res.json(await contactService.get(req.user.id, req.params.id)); } catch (e) { next(e); } }
async function update(req, res, next) { try { res.json(await contactService.update(req.user.id, req.params.id, req.body)); } catch (e) { next(e); } }
async function remove(req, res, next) { try { res.json(await contactService.remove(req.user.id, req.params.id)); } catch (e) { next(e); } }
async function bulkDelete(req, res, next) { try { res.json(await contactService.bulkRemove(req.user.id, req.body.ids)); } catch (e) { next(e); } }

module.exports = { list, create, get, update, remove, bulkDelete };
