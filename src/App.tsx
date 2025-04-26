import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import Room from './pages/Room';
import PrivateRoutes from './components/PrivateRoutes';
import { AuthProvider } from './utils/AuthContext';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<RegisterPage />}></Route>
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Room />}></Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
