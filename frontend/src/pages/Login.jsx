import { useState } from 'react';
import { api } from '../api';
import { saveAuth } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState(null);
  const nav=useNavigate();

  async function submit(e){
    e.preventDefault();
    setMsg(null);
    try{
      const res = await api('/login',{method:'POST',body:{email,password}});
      saveAuth(res);
      if (res.role === 'admin') nav('/admin');
      else nav('/dashboard');
    }catch(err){
      setMsg(`${err.code}: ${err.message}`);
    }
  }

  return (
    <div style={{maxWidth:420, margin:'2rem auto', fontFamily:'system-ui'}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:8}}/>
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:8}}/>
        <button style={{padding:'8px 12px'}}>Login</button>
      </form>
      <p style={{marginTop:12}}>Test Users:<br/>patient@example.com / Passw0rd!<br/>admin@example.com / Passw0rd!</p>
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </div>
  );
}
