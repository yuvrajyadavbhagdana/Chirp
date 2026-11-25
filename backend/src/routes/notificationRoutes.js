const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const notifications = require('../controllers/notificationController');
router.use(protect);
router.get('/', notifications.getNotifications);
router.put('/:id/read', notifications.markRead);
module.exports = router;
