import { useEffect, useState } from 'react';
import { api } from '../api';
import { getAuth, clearAuth } from '../auth';

export default function AdminDashboard(){
  const auth = getAuth();
  const [items,setItems]=useState([]);
  const [msg,setMsg]=useState(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await api('/all-bookings',{auth:auth.token});
        setItems(res);
      }catch(err){ setMsg(`${err.code}: ${err.message}`); }
    })();
  },[]);

  return (
    <div style={{maxWidth:720, margin:'2rem auto', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Admin Dashboard</h2>
        <button onClick={()=>{clearAuth();location.href='/login';}}>Logout</button>
      </div>
      <ul>
        {items.map(b=>(
          <li key={b.id} style={{margin:'8px 0',padding:8,border:'1px solid #ddd',borderRadius:8}}>
            <div><b>{new Date(b.start_at).toUTCString()}</b></div>
            <div>Patient: {b.patient_name} ({b.patient_email})</div>
          </li>
        ))}
      </ul>
      {items.length===0 && <p>No bookings.</p>}
      {msg && <p>{msg}</p>}
    </div>
  );
}
