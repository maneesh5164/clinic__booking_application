import { useEffect, useState } from 'react';
import { api } from '../api';
import { getAuth, clearAuth } from '../auth';
import { Link } from 'react-router-dom';

export default function MyBookings(){
  const auth = getAuth();
  const [items,setItems]=useState([]);
  const [msg,setMsg]=useState(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await api('/my-bookings',{auth:auth.token});
        setItems(res);
      }catch(err){ setMsg(`${err.code}: ${err.message}`); }
    })();
  },[]);

  return (
    <div style={{maxWidth:720, margin:'2rem auto', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <h2>My Bookings</h2>
        <div>
          <Link to="/dashboard" style={{marginRight:12}}>Back</Link>
          <button onClick={()=>{clearAuth();location.href='/login';}}>Logout</button>
        </div>
      </div>
      <ul>
        {items.map(b=>(
          <li key={b.id} style={{margin:'8px 0',padding:8,border:'1px solid #ddd',borderRadius:8}}>
            {new Date(b.start_at).toUTCString()} → {new Date(b.end_at).toUTCString()}
          </li>
        ))}
      </ul>
      {items.length===0 && <p>No bookings yet.</p>}
      {msg && <p>{msg}</p>}
    </div>
  );
}
