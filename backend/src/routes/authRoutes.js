const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { register, login, refresh, logout, me } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
