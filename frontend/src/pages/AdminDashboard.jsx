import { useEffect,useState } from 'react';
import { Users,MessageSquare,Link2,Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import Layout from '../components/Layout';

export default function AdminDashboard(){
 const [data,setData]=useState(null); const [tab,setTab]=useState('overview');
 const load=()=>api.get('/admin/dashboard').then(setData).catch((error)=>Swal.fire({icon:'error',title:'Admin data unavailable',text:error.message}));
 useEffect(()=>{load()},[]);
 const deletePost=async(id)=>{const result=await Swal.fire({title:'Delete post?',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Delete'});if(!result.isConfirmed)return;await api.delete(`/admin/posts/${id}`);load();};
 const deleteUser=async(id)=>{const result=await Swal.fire({title:'Delete user?',text:'Their posts and follows will also be removed.',icon:'warning',showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Delete'});if(!result.isConfirmed)return;await api.delete(`/admin/users/${id}`);load();};
 if(!data)return <Layout><div className="loading-state">Loading dashboard...</div></Layout>;
 return <Layout><div className="admin-page"><header className="feed-header"><h1>Admin dashboard</h1></header><nav className="admin-tabs"><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Overview</button><button className={tab==='users'?'active':''} onClick={()=>setTab('users')}>Users</button><button className={tab==='posts'?'active':''} onClick={()=>setTab('posts')}>Posts</button></nav>{tab==='overview'&&<><div className="stat-grid"><article><Users/><div><span>Total users</span><b>{data.totalUsers}</b></div></article><article><MessageSquare/><div><span>Total posts</span><b>{data.totalPosts}</b></div></article><article><Link2/><div><span>Follows</span><b>{data.totalFollows}</b></div></article></div><section className="admin-section"><h2>Recent users</h2>{data.recentUsers.map((item)=><div className="admin-row" key={item._id}><b>{item.name}</b><span>@{item.username}</span><em>{item.role}</em><button onClick={()=>deleteUser(item._id)} aria-label="Delete user"><Trash2/></button></div>)}</section></>} {tab==='users'&&<AdminUsers onDelete={deleteUser}/>} {tab==='posts'&&<AdminPosts onDelete={deletePost}/>}</div></Layout>;
}

function AdminUsers({onDelete}){const [users,setUsers]=useState([]);useEffect(()=>{api.get('/admin/users').then(setUsers)},[]);return <section className="admin-section">{users.map((item)=><div className="admin-row" key={item._id}><b>{item.name}</b><span>@{item.username}</span><em>{item.role}</em><button onClick={()=>onDelete(item._id)}><Trash2/></button></div>)}</section>}
function AdminPosts({onDelete}){const [posts,setPosts]=useState([]);useEffect(()=>{api.get('/admin/posts').then(setPosts)},[]);return <section className="admin-section">{posts.map((item)=><div className="admin-post" key={item._id}><div><b>@{item.author?.username}</b><p>{item.content}</p></div><button onClick={()=>onDelete(item._id)}><Trash2/></button></div>)}</section>}
