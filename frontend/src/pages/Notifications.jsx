import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart,MessageCircle,UserPlus } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Notifications(){
 const [items,setItems]=useState([]);
 useEffect(()=>{api.get('/notifications').then(setItems).catch(()=>setItems([]));},[]);
 const icons={like:<Heart/>,reply:<MessageCircle/>,follow:<UserPlus/>};
 return <Layout><header className="feed-header"><h1>Notifications</h1></header>{items.length?items.map((item)=><article className={`notification-item ${item.read?'':'unread'}`} key={item._id}><div className="notification-icon">{icons[item.type]}</div><div><Link to={`/profile/${item.sender?.username}`}><b>{item.sender?.name}</b></Link><p>{item.type==='like'?`liked your post` : item.type==='reply'?`replied to your post`:'started following you'}</p>{item.post&&<small>{item.post.content}</small>}</div></article>):<div className="empty-state"><h2>All caught up</h2><p>New likes, replies, and follows will appear here.</p></div>}</Layout>;
}
