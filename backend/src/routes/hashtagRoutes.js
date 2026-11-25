const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const hashtags = require('../controllers/hashtagController');

router.use(protect);
router.get('/trending', hashtags.getTrending);
router.get('/:tag', hashtags.getPostsByTag);

module.exports = router;
