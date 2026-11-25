import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Bookmark, Home, Search, Shield, User, Feather, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Layout({ children }) {
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
        <NavLink to="/home" className="brand" aria-label="Chirp home"><span className="brand-mark"><Feather size={20}/></span><span>Chirp</span></NavLink>
        <nav>
          <NavLink to="/home"><Home/><span>Home</span></NavLink>
          <NavLink to="/search"><Search/><span>Search</span></NavLink>
          <NavLink to="/notifications"><Bell/><span>Notifications</span></NavLink>
          <NavLink to={`/profile/${user?.username}`}><User/><span>Profile</span></NavLink>
          {user?.role === 'admin' && <NavLink to="/admin"><Shield/><span>Admin</span></NavLink>}
        </nav>
        <button className="nav-compose" onClick={() => document.querySelector('.composer textarea')?.focus()}>Chirp</button>
        <button className="logout-link" onClick={handleLogout}><LogOut/><span>Log out</span></button>
      </aside>
      <main className="main-column">{children}</main>
      <aside className="right-rail">
        <div className="profile-mini"><img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Chirp')}`} alt={`${user?.name || 'User'} avatar`}/><div><strong>{user?.name}</strong><span>@{user?.username}</span></div></div>
      </aside>
      <nav className="bottom-nav">
        <NavLink to="/home"><Home/></NavLink><NavLink to="/search"><Search/></NavLink><NavLink to="/notifications"><Bell/></NavLink><NavLink to={`/profile/${user?.username}`}><User/></NavLink>
      </nav>
    </div>
  );
}
