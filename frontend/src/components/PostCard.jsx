import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Share2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import YouTubeEmbed from './YouTubeEmbed';

export function renderContent(content) {
  return content.split(/(#\w+)/g).map((part, i) =>
    part.startsWith('#') ? <Link key={i} to={`/hashtag/${part.slice(1).toLowerCase()}`}>{part}</Link> : part
  );
}

export default function PostCard({ post, onChange, onReply }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [likedBy, setLikedBy] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.videoUrl);

  const toggleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked); setLikeCount((count) => count + (nextLiked ? 1 : -1));
    try { await (nextLiked ? api.post(`/posts/${post._id}/like`) : api.delete(`/posts/${post._id}/like`)); }
    catch (error) {
      setLiked(!nextLiked); setLikeCount((count) => count + (nextLiked ? -1 : 1));
      Swal.fire({ icon: 'error', title: 'Could not update like', text: error.message });
    }
  };

  const openLikes = async () => {
    setShowLikes(true);
    setLoadingLikes(true);
    try {
      const data = await api.get(`/posts/${post._id}/likes`);
      setLikedBy(data.users);
    } catch (error) {
      setShowLikes(false);
      Swal.fire({ icon: 'error', title: 'Could not load likes', text: error.message });
    } finally {
      setLoadingLikes(false);
    }
  };

  const remove = async () => {
    const result = await Swal.fire({ title: 'Delete this post?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
    if (!result.isConfirmed) return;
    try { await api.delete(`/posts/${post._id}`); Swal.fire({ icon: 'success', title: 'Post deleted', timer: 1200, showConfirmButton: false }); onChange?.(post._id); }
    catch (error) { Swal.fire({ icon: 'error', title: 'Delete failed', text: error.message }); }
  };

  return (
    <article className="post-card">
      <Link to={`/profile/${post.author.username}`}><img className="avatar" src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=ede9fe&color=4f46e5`} alt={`${post.author.name} avatar`}/></Link>
      <div className="post-body">
        <div className="post-meta"><Link to={`/profile/${post.author.username}`}><strong>{post.author.name}</strong><span>@{post.author.username}</span></Link><time>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time></div>
        <p className="post-content">{renderContent(post.content)}</p>
        {post.imageUrl && <img className="post-image" src={post.imageUrl} alt={`Image attached to ${post.author.name}'s post`} loading="lazy" referrerPolicy="no-referrer"/>}
        {post.videoUrl && (youtubeEmbedUrl
          ? <YouTubeEmbed url={youtubeEmbedUrl} title={`YouTube video from ${post.author.name}`}/>
          : videoUnavailable
            ? <div className="media-error" role="status"><strong>Video could not be loaded</strong><span>Use a direct MP4 or WebM file URL, or paste a YouTube video link.</span></div>
            : <video className="post-video" src={post.videoUrl} controls playsInline preload="metadata" aria-label={`Video from ${post.author.name}`} onError={() => setVideoUnavailable(true)}/>)}
        <div className="post-actions">
          <div className="post-like-action">
            <button className={liked ? 'liked' : ''} aria-label={liked ? 'Unlike post' : 'Like post'} onClick={toggleLike}><Heart fill={liked ? 'currentColor' : 'none'} size={18}/></button>
            <button className="post-action-count" aria-label={`View ${likeCount} likes`} onClick={openLikes}>{likeCount}</button>
          </div>
          <button onClick={() => onReply?.(post)}><MessageCircle size={18}/><span>{post.replyCount || 0}</span></button>
          <button onClick={() => navigator.share?.({ title: 'Twitter post', text: post.content, url: location.href })}><Share2 size={18}/></button>
          {(post.author._id === user?._id || post.author._id?.toString() === user?._id || user?.role === 'admin') && <button className="delete-action" onClick={remove} aria-label="Delete post"><Trash2 size={17}/></button>}
        </div>
      </div>
      {showLikes && <div className="reply-panel-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowLikes(false)}>
        <section className="reply-panel likes-panel" role="dialog" aria-modal="true" aria-labelledby={`likes-title-${post._id}`}>
          <button className="close-button" aria-label="Close likes list" onClick={() => setShowLikes(false)}>×</button>
          <h2 id={`likes-title-${post._id}`}>Liked by</h2>
          {loadingLikes ? <p className="rail-empty">Loading likes…</p> : likedBy.length
            ? likedBy.map((person) => <Link className="reply-item" key={person._id} to={`/profile/${person.username}`} onClick={() => setShowLikes(false)}>
              <img src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} alt={`${person.name} avatar`}/>
              <div><b>{person.name}</b><span>@{person.username}</span></div>
            </Link>)
            : <p className="rail-empty">No one has liked this post yet.</p>}
        </section>
      </div>}
    </article>
  );
}
