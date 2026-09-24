const express = require('express');
const controller = require('../controllers/contactController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.post('/', controller.create);
router.post('/bulk-delete', controller.bulkDelete);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
