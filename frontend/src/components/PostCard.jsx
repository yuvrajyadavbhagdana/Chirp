import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Share2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

  const toggleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked); setLikeCount((count) => count + (nextLiked ? 1 : -1));
    try { await (nextLiked ? api.post(`/posts/${post._id}/like`) : api.delete(`/posts/${post._id}/like`)); }
    catch (error) {
      setLiked(!nextLiked); setLikeCount((count) => count + (nextLiked ? -1 : 1));
      Swal.fire({ icon: 'error', title: 'Could not update like', text: error.message });
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
        <div className="post-actions">
          <button className={liked ? 'liked' : ''} onClick={toggleLike}><Heart fill={liked ? 'currentColor' : 'none'} size={18}/><span>{likeCount}</span></button>
          <button onClick={() => onReply?.(post)}><MessageCircle size={18}/><span>{post.replyCount || 0}</span></button>
          <button onClick={() => navigator.share?.({ title: 'Chirp post', text: post.content, url: location.href })}><Share2 size={18}/></button>
          {(post.author._id === user?._id || post.author._id?.toString() === user?._id || user?.role === 'admin') && <button className="delete-action" onClick={remove} aria-label="Delete post"><Trash2 size={17}/></button>}
        </div>
      </div>
    </article>
  );
}
