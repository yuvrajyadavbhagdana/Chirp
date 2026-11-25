const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { search } = require('../controllers/searchController');
router.get('/', protect, search);
module.exports = router;
