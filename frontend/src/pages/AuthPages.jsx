import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Feather, Mail, Lock, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true);
    try { await login(values.email, values.password); navigate('/home'); }
    catch (error) { Swal.fire({ icon: 'error', title: 'Sign-in failed', text: error.message, confirmButtonColor: '#4f46e5' }); }
    finally { setLoading(false); }
  };
  return <AuthLayout title="Welcome back" subtitle="Your community is waiting">
    <form onSubmit={submit} className="auth-form">
      <label>Email<div className="input-wrap"><Mail/><input type="email" required value={values.email} onChange={(e) => setValues({...values,email:e.target.value})}/></div></label>
      <label>Password<div className="input-wrap"><Lock/><input type={show?'text':'password'} required value={values.password} onChange={(e) => setValues({...values,password:e.target.value})}/><button type="button" onClick={() => setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div></label>
      <div className="form-row"><label className="check-label"><input type="checkbox"/> Remember me</label><a href="#">Forgot password?</a></div>
      <button className="primary-button" disabled={loading}>{loading?'Signing in...':'Log in'}</button>
      <p className="auth-switch">New to Chirp? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthLayout>;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name:'', email:'', password:'', confirm:'', avatar:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (values.password !== values.confirm) return Swal.fire({icon:'error', title:'Passwords do not match'});
    if (values.password.length < 8) return Swal.fire({icon:'error', title:'Use at least 8 characters'});
    setLoading(true);
    try {
      const createdUser = await register(values);
      await Swal.fire({icon:'success', title:'Welcome to Chirp!', text:`Your account has been created. Your username is @${createdUser.username}.`, confirmButtonColor:'#4f46e5'});
      navigate('/home');
    } catch (error) { Swal.fire({icon:'error', title:'Registration failed', text:error.message, confirmButtonColor:'#4f46e5'}); }
    finally { setLoading(false); }
  };
  return <AuthLayout title="Join your community" subtitle="Create your Chirp profile">
    <form onSubmit={submit} className="auth-form register-form">
      <label>Full name<div className="input-wrap"><User/><input required value={values.name} onChange={(e)=>setValues({...values,name:e.target.value})}/></div></label>
      <label>Email<div className="input-wrap"><Mail/><input type="email" required value={values.email} onChange={(e)=>setValues({...values,email:e.target.value})}/></div></label>
      <label>Password<div className="input-wrap"><Lock/><input type={show?'text':'password'} required minLength="8" value={values.password} onChange={(e)=>setValues({...values,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div></label>
      <label>Confirm password<div className="input-wrap"><Lock/><input type={show?'text':'password'} required value={values.confirm} onChange={(e)=>setValues({...values,confirm:e.target.value})}/></div></label>
      <label className="check-label terms"><input type="checkbox" required/> I agree to the Terms and Privacy Policy</label>
      <button className="primary-button" disabled={loading}>{loading?'Creating account...':'Create account'}</button>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </form>
  </AuthLayout>;
}

function AuthLayout({title,subtitle,children}) {
  return <div className="auth-page"><section className="auth-card"><Link className="brand auth-brand" to="/"><span className="brand-mark"><Feather/></span><span>Chirp</span></Link><h1>{title}</h1><p>{subtitle}</p>{children}</section><aside className="auth-visual"><div className="visual-grid"/><div className="floating-post one"><div className="mini-avatar"/><div><b>Campus update</b><p>Study session at the library tonight?</p></div></div><div className="floating-post two"><div className="mini-avatar purple"/><div><b>Community</b><p>Great ideas start with a conversation.</p></div></div></aside></div>;
}
