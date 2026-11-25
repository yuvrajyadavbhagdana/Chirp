require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');
const Follow = require('./models/Follow');
const Reply = require('./models/Reply');

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Post.deleteMany(), Follow.deleteMany(), Reply.deleteMany()]);
  const users = await User.create([
    { name: 'Aarav Mehta', username: 'aarav', email: 'aarav@twitter.test', password: 'Password123!', role: 'admin', bio: 'Building campus communities.', avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'Maya Chen', username: 'maya', email: 'maya@twitter.test', password: 'Password123!', bio: 'Design, coffee, and late-night study sessions.', avatar: 'https://i.pravatar.cc/150?img=32' },
    { name: 'Leo Martin', username: 'leo', email: 'leo@twitter.test', password: 'Password123!', bio: 'Developer and weekend photographer.', avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Sam Rivera', username: 'sam', email: 'sam@twitter.test', password: 'Password123!', bio: 'Basketball, music, and good ideas.', avatar: 'https://i.pravatar.cc/150?img=5' },
  ]);
  await Follow.create([
    { follower: users[1]._id, following: users[0]._id },
    { follower: users[1]._id, following: users[2]._id },
    { follower: users[2]._id, following: users[0]._id },
  ]);
  const posts = await Post.create([
    { author: users[0]._id, content: 'Welcome to Twitter! Your campus, your voice, your community. #CampusLife #TwitterLaunch' },
    { author: users[1]._id, content: 'A quiet afternoon in the library, finally making progress on my project. #StudyLife #Design', imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80' },
    { author: users[2]._id, content: 'A little workspace inspiration for the next open-source sprint. #Coding #CampusLife', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' },
    { author: users[3]._id, content: 'Who is joining the basketball tournament this Friday? #CampusLife #Sports', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80' },
    { author: users[1]._id, content: 'A tiny reminder to slow down and enjoy the day. #CampusLife', videoUrl: '/videos/sample-reel.mp4' },
    { author: users[0]._id, content: 'A short worth sharing with the community. #Twitter', videoUrl: 'https://youtube.com/shorts/TICYw82Y9Us' },
  ]);
  await Reply.create([
    { post: posts[0]._id, author: users[1]._id, content: 'Excited to be here! Looking forward to meeting everyone.' },
    { post: posts[1]._id, author: users[2]._id, content: 'That looks like the perfect spot to focus.' },
    { post: posts[2]._id, author: users[0]._id, content: 'Love the setup. What are you building?' },
    { post: posts[3]._id, author: users[1]._id, content: 'Count me in! What time does it start?' },
    { post: posts[4]._id, author: users[2]._id, content: 'This is such a nice little break from studying.' },
    { post: posts[5]._id, author: users[1]._id, content: 'Thanks for sharing this!' },
  ]);
  await Promise.all(posts.map((post) => {
    post.replyCount = 1;
    return post.save();
  }));
  console.log('Seed complete.');
  console.log('Admin login: aarav@twitter.test / Password123!');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
