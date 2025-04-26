import { ChangeEvent, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { handleUserRegister } = useAuth();
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password1: '',
    password2: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setCredentials({ ...credentials, [name]: value });
  };
  return (
    <div className="auth--container">
      <div className="form--wrapper">
        <form onSubmit={(e) => handleUserRegister(e, credentials)}>
          <div className="field--wrapper">
            <label htmlFor="name">Name:</label>
            <input type="text" required id="name" name="name" placeholder="Enter your name..." value={credentials.name} onChange={handleInputChange} />
          </div>
          <div className="field--wrapper">
            <label htmlFor="email">Email:</label>
            <input type="email" required id="email" name="email" placeholder="Enter your email..." value={credentials.email} onChange={handleInputChange} />
          </div>
          <div className="field--wrapper">
            <label htmlFor="password1">Password:</label>
            <input type="password" required id="password1" name="password1" placeholder="Enter your password..." value={credentials.password1} onChange={handleInputChange} />
          </div>
          <div className="field--wrapper">
            <label htmlFor="password2">Confirm Password:</label>
            <input type="password" required id="password2" name="password2" placeholder="Confirm your password..." value={credentials.password2} onChange={handleInputChange} />
          </div>
          <div className="field--wrapper">
            <input className="btn btn--lg btn--main" type="submit" value="Login" />
          </div>
        </form>
        <p>
          Already have an accouunt? Login <Link to="/login">here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
