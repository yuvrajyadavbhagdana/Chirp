import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Home, Search, Shield, User, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import BrandMark from './BrandMark';

export default function Layout({ children, rightRail }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const result = await Swal.fire({ title: 'Log out?', icon: 'question', showCancelButton: true, confirmButtonText: 'Log out', confirmButtonColor: '#4f46e5' });
    if (result.isConfirmed) {
      await logout();
      navigate('/');
    }
  };
  return (
    <div className="app-shell">
      <aside className="left-nav">
        <NavLink to="/home" className="brand" aria-label="Twitter home"><BrandMark/><span>Twitter</span></NavLink>
        <nav>
          <NavLink to="/home"><Home/><span>Home</span></NavLink>
          <NavLink to="/search"><Search/><span>Explore</span></NavLink>
          <NavLink to="/notifications"><Bell/><span>Notifications</span></NavLink>
          <NavLink to="/search"><UserPlus/><span>Follow</span></NavLink>
          <NavLink to={`/profile/${user?.username}`}><User/><span>Profile</span></NavLink>
          {user?.role === 'admin' && <NavLink to="/admin"><Shield/><span>Admin</span></NavLink>}
        </nav>
        <button className="nav-compose" onClick={() => document.querySelector('.composer textarea')?.focus()}>Post</button>
        <div className="nav-account">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`} alt=""/>
          <span><strong>{user?.name}</strong><small>@{user?.username}</small></span>
          <button type="button" aria-label="Log out" onClick={handleLogout}><LogOut/></button>
        </div>
      </aside>
      <main className="main-column">{children}</main>
      <aside className="right-rail">{rightRail || (
        <div className="profile-mini"><img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Twitter')}`} alt={`${user?.name || 'User'} avatar`}/><div><strong>{user?.name}</strong><span>@{user?.username}</span></div></div>
      )}</aside>
      <nav className="bottom-nav">
        <NavLink to="/home"><Home/></NavLink><NavLink to="/search"><Search/></NavLink><NavLink to="/notifications"><Bell/></NavLink><NavLink to={`/profile/${user?.username}`}><User/></NavLink>
      </nav>
    </div>
  );
}
