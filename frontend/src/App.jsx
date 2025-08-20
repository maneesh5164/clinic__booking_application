import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import ProtectedRoute from './components/ProtectedRoute';

export default function App(){
  return (
    <BrowserRouter>
      <nav style={{padding:12,borderBottom:'1px solid #eee',fontFamily:'system-ui'}}>
        <Link to="/" style={{marginRight:12}}>Home</Link>
        <Link to="/login" style={{marginRight:12}}>Login</Link>
        <Link to="/register">Register</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div style={{padding:16,fontFamily:'system-ui'}}><h2>Clinic Booking</h2><p>Simple 30-min appointment slots (UTC).</p></div>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={
          <ProtectedRoute role="patient"><PatientDashboard/></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute role="patient"><MyBookings/></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
