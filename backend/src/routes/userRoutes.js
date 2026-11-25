const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const users = require('../controllers/userController');
const follows = require('../controllers/followController');

router.use(protect);
router.put('/profile', users.updateProfile);
router.get('/:username', users.getProfile);
router.get('/:username/posts', users.getUserPosts);
router.get('/:username/followers', follows.getFollowers);
router.get('/:username/following', follows.getFollowing);
router.post('/:id/follow', follows.followUser);
router.delete('/:id/follow', follows.unfollowUser);

module.exports = router;
