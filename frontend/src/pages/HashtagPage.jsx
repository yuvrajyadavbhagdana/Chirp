import { useEffect,useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';

export default function HashtagPage(){
 const {tag}=useParams(); const [posts,setPosts]=useState([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{setLoading(true);api.get(`/hashtags/${tag}`).then((data)=>setPosts(data.posts)).catch(()=>setPosts([])).finally(()=>setLoading(false));},[tag]);
 return <Layout><header className="feed-header"><h1>#{tag}</h1></header>{loading?<div className="loading-state">Loading posts...</div>:posts.length?posts.map((post)=><PostCard key={post._id} post={post} onChange={(id)=>setPosts((current)=>current.filter((item)=>item._id!==id))}/>):<div className="empty-state"><h2>No posts found</h2><p>Be the first to tweet about #{tag}.</p></div>}</Layout>;
}
