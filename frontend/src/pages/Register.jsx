import { useState } from 'react';
import { api } from '../api';

export default function Register() {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState(null);

  async function submit(e){
    e.preventDefault();
    setMsg(null);
    try{
      await api('/register',{method:'POST',body:{name,email,password}});
      setMsg('Registered! You can now login.');
    }catch(err){
      setMsg(`${err.code}: ${err.message}`);
    }
  }

  return (
    <div style={{maxWidth:420, margin:'2rem auto', fontFamily:'system-ui'}}>
      <h2>Register (Patient)</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:8}}/>
        <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:8}}/>
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:8}}/>
        <button style={{padding:'8px 12px'}}>Register</button>
      </form>
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </div>
  );
}
