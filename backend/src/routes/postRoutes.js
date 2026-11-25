const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const posts = require('../controllers/postController');
const replies = require('../controllers/replyController');

router.use(protect);
router.route('/').post(posts.createPost).get(posts.getPosts);
router.get('/feed', posts.getFeed);
router.route('/:id').get(posts.getPost).delete(posts.deletePost);
router.post('/:id/like', posts.likePost);
router.delete('/:id/like', posts.unlikePost);
router.route('/:id/replies').get(replies.getReplies).post(replies.createReply);

module.exports = router;
