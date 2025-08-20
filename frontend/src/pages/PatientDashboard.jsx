import { useEffect, useState } from 'react';
import { api } from '../api';
import { getAuth, clearAuth } from '../auth';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const auth = getAuth();
  const [slots,setSlots]=useState([]);
  const [range,setRange]=useState({from:'',to:''});
  const [msg,setMsg]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(() => {
    let mounted=true;
    (async () => {
      setLoading(true);
      try {
        const res = await api(`/slots`, { auth: auth.token });
        if (!mounted) return;
        setRange({from:res.from,to:res.to});
        setSlots(res.slots);
      } catch (err) { setMsg(`${err.code}: ${err.message}`); }
      setLoading(false);
    })();
    return ()=>{mounted=false};
  }, []);

  async function book(slotId){
    setMsg(null);
    try{
      await api('/book',{method:'POST',auth:auth.token,body:{slotId}});
      setMsg('Booked!');
      setSlots(slots.filter(s=>s.id!==slotId));
    }catch(err){
      setMsg(`${err.code}: ${err.message}`);
    }
  }

  return (
    <div style={{maxWidth:720, margin:'2rem auto', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Patient Dashboard</h2>
        <div>
          <Link to="/my-bookings" style={{marginRight:12}}>My Bookings</Link>
          <button onClick={()=>{clearAuth();location.href='/login';}}>Logout</button>
        </div>
      </div>
      <p>Available (UTC) from <b>{range.from}</b> to <b>{range.to}</b></p>
      {loading ? <p>Loading...</p> :
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
          {slots.map(s=>(
            <div key={s.id} style={{border:'1px solid #ddd',borderRadius:8,padding:12}}>
              <div><b>{new Date(s.start_at).toUTCString()}</b></div>
              <div>→ {new Date(s.end_at).toUTCString()}</div>
              <button style={{marginTop:8}} onClick={()=>book(s.id)}>Book</button>
            </div>
          ))}
          {slots.length===0 && <p>No available slots.</p>}
        </div>
      }
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </div>
  );
}
