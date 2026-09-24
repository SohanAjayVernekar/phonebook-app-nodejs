const express = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authenticate, controller.me);
router.patch('/me', authenticate, controller.updateMe);
router.patch('/me/password', authenticate, controller.password);

module.exports = router;
