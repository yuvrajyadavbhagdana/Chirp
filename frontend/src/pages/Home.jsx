import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import EmojiPicker from '../components/EmojiPicker';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyPost, setReplyPost] = useState(null);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [feed, tags] = await Promise.all([api.get('/posts/feed'), api.get('/hashtags/trending')]);
      setPosts(feed.posts); setTrending(tags);
    } catch (error) { Swal.fire({icon:'error',title:'Could not load feed',text:error.message}); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createPost = async (event) => {
    event.preventDefault(); if (!content.trim()) return;
    setPosting(true);
    try { const post = await api.post('/posts',{content:content.trim()}); setPosts((current)=>[post,...current]); setContent(''); }
    catch (error) { Swal.fire({icon:'error',title:'Post failed',text:error.message}); }
    finally { setPosting(false); }
  };

  const openReply = async (post) => {
    setReplyPost(post);
    try { const data = await api.get(`/posts/${post._id}/replies`); setReplies(data.replies); } catch {}
  };
  const submitReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    try { const item = await api.post(`/posts/${replyPost._id}/replies`,{content:reply.trim()}); setReplies((current)=>[item,...current]); setReply(''); setPosts((current)=>current.map((post)=>post._id===replyPost._id?{...post,replyCount:(post.replyCount||0)+1}:post)); }
    catch (error) { Swal.fire({icon:'error',title:'Reply failed',text:error.message}); }
  };

  return <Layout>
    <header className="feed-header"><h1>Home</h1></header>
    <form className="composer" onSubmit={createPost}>
      <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'User')}`} alt="Your avatar"/>
      <div><textarea value={content} maxLength="280" onChange={(e)=>setContent(e.target.value)} placeholder="What is happening?"/><div className="composer-footer"><div><button type="button" aria-label="Add image"><Image/></button><EmojiPicker value={content} onChange={setContent}/></div><div><span className={content.length>240?'counter warn':''}>{280-content.length}</span><button className="primary-button" disabled={!content.trim()||posting}>{posting?'Posting...':'Post'}</button></div></div></div>
    </form>
    {loading ? <div className="loading-state"><LoaderCircle className="spin"/> Loading your feed</div> : posts.length ? posts.map((post)=><PostCard key={post._id} post={post} onChange={(id)=>setPosts((current)=>current.filter((item)=>item._id!==id))} onReply={openReply}/>) : <div className="empty-state"><div>✦</div><h2>Your feed is ready</h2><p>Follow people or share the first post to start the conversation.</p></div>}
    {trending.length>0 && <section className="mobile-trends"><h3>Trending now</h3>{trending.map((tag)=><Link key={tag.tag} to={`/hashtag/${tag.tag}`}><b>#{tag.tag}</b><span>{tag.count} posts</span></Link>)}</section>}
    {replyPost && <div className="reply-panel-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&setReplyPost(null)}><section className="reply-panel"><button className="close-button" onClick={()=>setReplyPost(null)}>×</button><h2>Replies</h2><article className="reply-context">{replyPost.content}</article><form className="reply-form" onSubmit={submitReply}><input value={reply} maxLength="280" onChange={(e)=>setReply(e.target.value)} placeholder="Write a reply"/><button className="primary-button" disabled={!reply.trim()}>Reply</button></form><div>{replies.map((item)=><article className="reply-item" key={item._id}><img src={item.author.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(item.author.name)}`} alt={`${item.author.name} avatar`}/><div><b>{item.author.name}</b><span>@{item.author.username}</span><p>{item.content}</p></div></article>)}</div></section></div>}
  </Layout>;
}
