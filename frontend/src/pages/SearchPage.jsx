import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function SearchPage(){
 const [query,setQuery]=useState(''); const [results,setResults]=useState({users:[],hashtags:[]}); const [loading,setLoading]=useState(false);
 useEffect(()=>{
  if(!query.trim()){setResults({users:[],hashtags:[]});return;}
  setLoading(true); const timer=setTimeout(async()=>{try{setResults(await api.get(`/search?q=${encodeURIComponent(query)}`));}finally{setLoading(false)}},300);
  return()=>clearTimeout(timer);
 },[query]);
 return <Layout><header className="feed-header"><h1>Search</h1></header><div className="search-box"><Search/><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search people or hashtags"/></div>{loading?<div className="loading-state">Searching...</div>:query&&!results.users.length&&!results.hashtags.length?<div className="empty-state"><h2>No results</h2><p>Try a different name or hashtag.</p></div>:<>{results.users.length>0&&<section className="search-section"><h2>People</h2>{results.users.map((person)=><Link className="user-result" key={person._id} to={`/profile/${person.username}`}><img src={person.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=ede9fe&color=4f46e5`} alt={`${person.name} avatar`}/><div><b>{person.name}</b><span>@{person.username}</span></div></Link>)}</section>}<section className="search-section"><h2>Hashtags</h2>{results.hashtags.map((tag)=><Link className="hashtag-result" key={tag} to={`/hashtag/${tag}`}><span>#</span><div><b>{tag}</b><small>Explore posts</small></div></Link>)}</section></>}</Layout>;
}
