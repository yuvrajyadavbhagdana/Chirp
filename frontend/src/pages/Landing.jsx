import { Link } from 'react-router-dom';
import { Feather, Users, Hash, MessageCircle, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return <div className="landing">
    <nav className="landing-nav"><Link className="brand" to="/"><span className="brand-mark"><Feather/></span><span>Chirp</span></Link><div><Link className="text-link" to="/login">Log in</Link><Link className="nav-register" to="/register">Join Chirp</Link></div></nav>
    <header className="landing-hero">
      <div><span className="eyebrow">YOUR CAMPUS, CONNECTED</span><h1>Your campus.<br/>Your voice.<br/><em>Your community.</em></h1><p>Share ideas, find your people, and stay close to everything happening around you.</p><div className="hero-actions"><Link className="primary-button" to="/register">Create your account</Link><Link className="secondary-button" to="/login">Log in</Link></div></div>
      <div className="hero-preview"><div className="preview-card"><div className="preview-head"><span className="preview-avatar"/><div><b>Maya Chen</b><small>@maya · now</small></div></div><p>The student showcase was incredible. So much talent in one room! <span>#CampusLife</span></p><div className="preview-tags"><b>#CampusLife</b><b>#Design</b><b>#StudyLife</b></div></div><div className="preview-bubble"><Users/> 2.4k voices</div></div>
    </header>
    <section className="landing-features"><article><Hash/><h3>Discover trends</h3><p>Follow the conversations shaping your campus.</p></article><article><MessageCircle/><h3>Start conversations</h3><p>Share updates in 280 characters or less.</p></article><article><ShieldCheck/><h3>A safer community</h3><p>Thoughtful tools and active moderation.</p></article></section>
  </div>;
}
