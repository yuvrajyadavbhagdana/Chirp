import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const [profile,setProfile] = useState(null);
  const [posts,setPosts] = useState([]);

  const load = async () => {
    try {
      const [profileData, postData] = await Promise.all([api.get(`/users/${username}`),api.get(`/users/${username}/posts`)]);
      setProfile(profileData); setPosts(postData.posts);
    } catch (error) { Swal.fire({icon:'error',title:'Could not load profile',text:error.message}); }
  };
  useEffect(()=>{load()},[username]);

  const toggleFollow = async () => {
    try {
      const data = profile.isFollowing ? await api.delete(`/users/${profile._id}/follow`) : await api.post(`/users/${profile._id}/follow`);
      setProfile({...profile,isFollowing:data.following,followers:profile.followers+(data.following?1:-1)});
    } catch (error) { Swal.fire({icon:'error',title:'Could not update follow',text:error.message}); }
  };
  const editProfile = async () => {
    const result=await Swal.fire({title:'Edit profile',html:`<input id="profile-name" class="swal2-input" value="${profile.name.replace(/"/g,'&quot;')}" placeholder="Full name"><textarea id="profile-bio" class="swal2-textarea" placeholder="Bio">${profile.bio||''}</textarea>`,showCancelButton:true,confirmButtonText:'Save',preConfirm:()=>({name:document.querySelector('#profile-name').value,bio:document.querySelector('#profile-bio').value})});
    if(!result.isConfirmed)return;
    try { const updated=await api.put('/users/profile',result.value); updateUser(updated); setProfile({...profile,...updated}); Swal.fire({icon:'success',title:'Profile updated',timer:1200,showConfirmButton:false}); } catch(error){Swal.fire({icon:'error',title:'Update failed',text:error.message});}
  };
  if(!profile)return <Layout><div className="loading-state">Loading profile...</div></Layout>;
  return <Layout><div className="profile-page">
    <header className="profile-cover" style={profile.coverImage?{backgroundImage:`url(${profile.coverImage})`}:{}}/>
    <section className="profile-info"><img src={profile.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=160&background=ede9fe&color=4f46e5`} alt={`${profile.name} avatar`}/><div className="profile-actions">{profile.isOwnProfile?<button className="secondary-button" onClick={editProfile}><Edit3/>Edit profile</button>:<button className={profile.isFollowing?'secondary-button':'primary-button'} onClick={toggleFollow}>{profile.isFollowing?'Following':'Follow'}</button>}</div><h1>{profile.name}</h1><p className="profile-username">@{profile.username}</p>{profile.bio&&<p className="profile-bio">{profile.bio}</p>}<p className="joined"><Calendar/> Joined {new Date(profile.createdAt).toLocaleDateString([], {month:'long',year:'numeric'})}</p><div className="profile-stats"><b>{profile.following}<span> Following</span></b><b>{profile.followers}<span> Followers</span></b><b>{profile.posts}<span> Posts</span></b></div></section>
    <div className="profile-tabs"><button className="active">Posts</button></div>
    {posts.length?posts.map((post)=><PostCard key={post._id} post={post} onChange={(id)=>setPosts((current)=>current.filter((item)=>item._id!==id))}/>):<div className="empty-state"><h2>No posts yet</h2><p>When @{profile.username} posts, they will appear here.</p></div>}
  </div></Layout>;
}
