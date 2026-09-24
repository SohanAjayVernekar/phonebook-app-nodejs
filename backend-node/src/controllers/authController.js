const authService = require('../services/authService');
const { userDto } = require('../utils/dto');

async function register(req, res, next) { try { res.status(201).json(await authService.register(req.body)); } catch (e) { next(e); } }
async function login(req, res, next) { try { res.json(await authService.login(req.body)); } catch (e) { next(e); } }
function me(req, res) { res.json(userDto(req.user)); }
async function updateMe(req, res, next) { try { res.json(await authService.updateProfile(req.user.id, req.body)); } catch (e) { next(e); } }
async function password(req, res, next) { try { await authService.changePassword(req.user, req.body); res.status(204).end(); } catch (e) { next(e); } }

module.exports = { register, login, me, updateMe, password };
