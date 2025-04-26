import { ChangeEvent, useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { user, handleUserLogin } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setCredentials({ ...credentials, [name]: value });
  };

  return (
    <div className="auth--container">
      <div className="form--wrapper">
        <form onSubmit={(e) => handleUserLogin(e, credentials)}>
          <div className="field--wrapper">
            <label htmlFor="email">Email:</label>
            <input type="email" required id="email" name="email" placeholder="Enter your email..." value={credentials.email} onChange={handleInputChange} />
          </div>
          <div className="field--wrapper">
            <label htmlFor="password">Password:</label>
            <input type="password" required id="password" name="password" placeholder="Enter your password..." value={credentials.password} onChange={handleInputChange} />
          </div>
          <div className="field--wrapper">
            <input className="btn btn--lg btn--main" type="submit" value="Login" />
          </div>
        </form>
        <p>
          Don't have an accouunt? Register <Link to="/register">here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
