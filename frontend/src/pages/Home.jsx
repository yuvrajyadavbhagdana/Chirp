import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, LoaderCircle, Search, Feather, TrendingUp } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import EmojiPicker from '../components/EmojiPicker';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { getYouTubeEmbedUrl } from '../utils/youtube';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [followingFeed, setFollowingFeed] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyPost, setReplyPost] = useState(null);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const feedPath = followingFeed ? '/posts/feed' : '/posts';
      const [feed, tags, people] = await Promise.all([
        api.get(feedPath),
        api.get('/hashtags/trending'),
        api.get('/users/suggested'),
      ]);
      setPosts(feed.posts);
      setTrending(tags);
      setSuggested(people);
    } catch (error) { Swal.fire({icon:'error',title:'Could not load feed',text:error.message}); }
    finally { setLoading(false); }
  }, [followingFeed]);
  useEffect(() => { load(); }, [load]);

  const createPost = async (event) => {
    event.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) return;
    setPosting(true);
    try {
      const post = await api.post('/posts', {
        content: content.trim(),
        imageUrl: mediaType === 'image' ? mediaUrl.trim() : '',
        videoUrl: mediaType === 'video' ? mediaUrl.trim() : '',
      });
      setPosts((current) => [post, ...current]);
      setContent('');
      setMediaUrl('');
      setShowMediaInput(false);
    }
    catch (error) { Swal.fire({icon:'error',title:'Post failed',text:error.message}); }
    finally { setPosting(false); }
  };

  const toggleMediaInput = (type) => {
    if (showMediaInput && mediaType === type) {
      setShowMediaInput(false);
      setMediaUrl('');
      return;
    }
    setMediaType(type);
    setMediaUrl(type === 'video' ? `${window.location.origin}/videos/sample-reel.mp4` : '');
    setShowMediaInput(true);
  };

  const openReply = async (post) => {
    setReplyPost(post);
    try {
      const data = await api.get(`/posts/${post._id}/replies`);
      setReplies(data.replies);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Could not load comments', text: error.message });
    }
  };
  const submitReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    try { const item = await api.post(`/posts/${replyPost._id}/replies`,{content:reply.trim()}); setReplies((current)=>[item,...current]); setReply(''); setPosts((current)=>current.map((post)=>post._id===replyPost._id?{...post,replyCount:(post.replyCount||0)+1}:post)); }
    catch (error) { Swal.fire({icon:'error',title:'Reply failed',text:error.message}); }
  };

  const followSuggested = async (person) => {
    try {
      await api.post(`/users/${person._id}/follow`);
      setSuggested((current) => current.filter((item) => item._id !== person._id));
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Could not follow account', text: error.message });
    }
  };

  const youtubePreviewUrl = mediaType === 'video' ? getYouTubeEmbedUrl(mediaUrl) : null;
  const rightRail = <div className="home-sidebar">
    <Link className="rail-search" to="/search"><Search size={19}/><span>Search Twitter</span></Link>
    <section className="rail-card">
      <h2><TrendingUp size={19}/> What&apos;s happening</h2>
      {trending.length ? trending.slice(0, 5).map((tag) => <Link className="trend-item" key={tag.tag} to={`/hashtag/${tag.tag}`}>
        <span>Trending in your community</span><strong>#{tag.tag}</strong><small>{tag.count} posts</small>
      </Link>) : <p className="rail-empty">Popular topics will show up here.</p>}
      {trending.length > 5 && <Link className="rail-more" to="/search">Explore more</Link>}
    </section>
    <section className="rail-card suggestions-card">
      <h2>Who to follow</h2>
      {suggested.length ? suggested.map((person) => <div className="suggestion" key={person._id}>
        <Link className="suggested-person" to={`/profile/${person.username}`}>
          <img src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=252525&color=e7e9ea`} alt={`${person.name} avatar`}/>
          <span><strong>{person.name}</strong><small>@{person.username}</small></span>
        </Link>
        <button type="button" onClick={() => followSuggested(person)}>Follow</button>
      </div>) : <p className="rail-empty">You&apos;re all caught up on people to follow.</p>}
    </section>
    <p className="rail-footer">About · Privacy · Terms · Twitter</p>
  </div>;

  return <Layout rightRail={rightRail}>
    <header className="feed-header">
      <h1 className="visually-hidden">Home timeline</h1>
      <button className={!followingFeed ? 'feed-tab active' : 'feed-tab'} onClick={() => setFollowingFeed(false)} aria-pressed={!followingFeed}>For you</button>
      <button className={followingFeed ? 'feed-tab active' : 'feed-tab'} onClick={() => setFollowingFeed(true)} aria-pressed={followingFeed}>Following</button>
      <button className="feed-compose-shortcut" aria-label="Write a post" onClick={() => document.querySelector('.composer textarea')?.focus()}><Feather size={19}/></button>
    </header>
    <form className="composer" onSubmit={createPost}>
      <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'User')}`} alt="Your avatar"/>
      <div>
        <textarea value={content} maxLength="280" onChange={(e)=>setContent(e.target.value)} placeholder="What is happening?"/>
        {showMediaInput && <div className="composer-image-field">
          <label htmlFor="post-media-url">{mediaType === 'image' ? 'Image URL' : 'Video URL'}</label>
          <input id="post-media-url" type="url" value={mediaUrl} onChange={(e)=>setMediaUrl(e.target.value)} placeholder={mediaType === 'image' ? 'Paste an image URL (https://...)' : 'MP4/WebM or YouTube video link'}/>
          {mediaUrl.trim() && (mediaType === 'image'
            ? <img className="composer-image-preview" src={mediaUrl} alt="Preview of attached image"/>
            : youtubePreviewUrl
              ? <YouTubeEmbed url={youtubePreviewUrl} title="YouTube video preview"/>
              : <video className="composer-video-preview" src={mediaUrl} controls muted playsInline preload="metadata" aria-label="Preview of attached video"/>)}
        </div>}
        <div className="composer-footer">
          <div>
            <button type="button" aria-label="Add image" aria-pressed={showMediaInput && mediaType === 'image'} onClick={()=>toggleMediaInput('image')}><Image/></button>
            <button type="button" aria-label="Add video" aria-pressed={showMediaInput && mediaType === 'video'} onClick={()=>toggleMediaInput('video')}><Video/></button>
            <EmojiPicker value={content} onChange={setContent}/>
          </div>
          <div>
            <span className={content.length>240?'counter warn':''}>{280-content.length}</span>
            <button className="primary-button" disabled={(!content.trim()&&!mediaUrl.trim())||posting}>{posting?'Posting...':'Post'}</button>
          </div>
        </div>
      </div>
    </form>
    {loading ? <div className="loading-state"><LoaderCircle className="spin"/> Loading your feed</div> : posts.length ? posts.map((post)=><PostCard key={post._id} post={post} onChange={(id)=>setPosts((current)=>current.filter((item)=>item._id!==id))} onReply={openReply}/>) : <div className="empty-state"><div>✦</div><h2>{followingFeed ? 'Your following feed is quiet' : 'Your feed is ready'}</h2><p>Follow people or share the first post to start the conversation.</p></div>}
    {trending.length>0 && <section className="mobile-trends"><h3>Trending now</h3>{trending.map((tag)=><Link key={tag.tag} to={`/hashtag/${tag.tag}`}><b>#{tag.tag}</b><span>{tag.count} posts</span></Link>)}</section>}
    {replyPost && <div className="reply-panel-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&setReplyPost(null)}><section className="reply-panel"><button className="close-button" onClick={()=>setReplyPost(null)}>×</button><h2>Replies</h2><article className="reply-context">{replyPost.content}</article><form className="reply-form" onSubmit={submitReply}><input value={reply} maxLength="280" onChange={(e)=>setReply(e.target.value)} placeholder="Write a reply"/><button className="primary-button" disabled={!reply.trim()}>Reply</button></form><div>{replies.map((item)=><article className="reply-item" key={item._id}><img src={item.author.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(item.author.name)}`} alt={`${item.author.name} avatar`}/><div><b>{item.author.name}</b><span>@{item.author.username}</span><p>{item.content}</p></div></article>)}</div></section></div>}
  </Layout>;
}
