import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Map3D from './pages/Map3D';
import Parcels from './pages/Parcels';
import ULPIN from './pages/ULPIN';
import Analysis from './pages/Analysis';
import Validation from './pages/Validation';
import Infrastructure from './pages/Infrastructure';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map3D />} />
          <Route path="/parcels" element={<Parcels />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/ulpin" element={<ULPIN />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
