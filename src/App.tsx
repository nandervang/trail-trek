import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';
import GearList from './pages/gear/GearList';
import GearForm from './pages/gear/GearForm';
import HikeList from './pages/hikes/HikeList';
import HikeForm from './pages/hikes/HikeForm';
import HikeDetails from './pages/hikes/HikeDetails';
import HikePlanner from './pages/hikes/HikePlanner';
import SharedHike from './pages/shared/SharedHike';
import NotFound from './pages/NotFound';
import LogForm from './pages/logs/LogForm';

function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      {/* Public shared hike route */}
      <Route path="/shared/:shareId" element={<SharedHike />} />
      
      {/* Protected routes */}
      <Route element={<Layout />}>
        <Route path="/" element={!user ? <Navigate to="/login" /> : <Dashboard />} />
        
        {/* Gear routes */}
        <Route path="/gear" element={!user ? <Navigate to="/login" /> : <GearList />} />
        <Route path="/gear/new" element={!user ? <Navigate to="/login" /> : <GearForm />} />
        <Route path="/gear/:id" element={!user ? <Navigate to="/login" /> : <GearForm />} />
        
        {/* Hike routes */}
        <Route path="/hikes" element={!user ? <Navigate to="/login" /> : <HikeList />} />
        <Route path="/hikes/new" element={!user ? <Navigate to="/login" /> : <HikeForm />} />
        <Route path="/hikes/:id" element={!user ? <Navigate to="/login" /> : <HikeDetails />} />
        <Route path="/hikes/:id/edit" element={!user ? <Navigate to="/login" /> : <HikeForm />} />
        <Route path="/hikes/:id/log" element={!user ? <Navigate to="/login" /> : <LogForm />} />
        <Route path="/hikes/:id/planner" element={!user ? <Navigate to="/login" /> : <HikePlanner />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;