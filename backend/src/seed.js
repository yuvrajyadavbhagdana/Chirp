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
    { name: 'Aarav Mehta', username: 'aarav', email: 'aarav@chirp.test', password: 'Password123!', role: 'admin', bio: 'Building campus communities.', avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'Maya Chen', username: 'maya', email: 'maya@chirp.test', password: 'Password123!', bio: 'Design, coffee, and late-night study sessions.', avatar: 'https://i.pravatar.cc/150?img=32' },
    { name: 'Leo Martin', username: 'leo', email: 'leo@chirp.test', password: 'Password123!', bio: 'Developer and weekend photographer.', avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Sam Rivera', username: 'sam', email: 'sam@chirp.test', password: 'Password123!', bio: 'Basketball, music, and good ideas.', avatar: 'https://i.pravatar.cc/150?img=5' },
  ]);
  await Follow.create([
    { follower: users[1]._id, following: users[0]._id },
    { follower: users[1]._id, following: users[2]._id },
    { follower: users[2]._id, following: users[0]._id },
  ]);
  const posts = await Post.create([
    { author: users[0]._id, content: 'Welcome to Chirp! Your campus, your voice, your community. #CampusLife #ChirpLaunch' },
    { author: users[1]._id, content: 'The library was unusually peaceful today. Working on my final project with a new playlist. #StudyLife #Design' },
    { author: users[2]._id, content: 'Shipping my first open-source contribution this week. The community has been incredibly helpful! #Coding #CampusLife' },
    { author: users[3]._id, content: 'Who is joining the basketball tournament this Friday? #CampusLife #Sports' },
  ]);
  await Reply.create({ post: posts[0]._id, author: users[1]._id, content: 'Excited to be here!' });
  posts[0].replyCount = 1;
  await posts[0].save();
  console.log('Seed complete.');
  console.log('Admin login: aarav@chirp.test / Password123!');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
