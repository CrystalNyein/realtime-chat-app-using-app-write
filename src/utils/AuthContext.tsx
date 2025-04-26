import { createContext, useState, useEffect, useContext, ReactNode, FormEvent } from 'react';
import { account } from '../appwriteConfig';
import { useNavigate } from 'react-router-dom';
import { ID, type Models } from 'appwrite';

type UserLogin = {
  email: string;
  password: string;
};

type UserRegister = {
  name: string;
  email: string;
  password1: string;
  password2: string;
};
interface AuthContextProps {
  user: Models.User<Models.Preferences> | null;
  handleUserLogin: (e: FormEvent, credentials: UserLogin) => void;
  handleUserLogout: () => void;
  handleUserRegister: (e: FormEvent, credentials: UserRegister) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserOnLoad();
  }, []);
  const getUserOnLoad = async () => {
    try {
      const accountDetails = await account.get();
      setUser(accountDetails);
    } catch (error) {
      console.info(error);
    }
    setLoading(false);
  };

  const handleUserRegister = async (e: FormEvent, credentials: UserRegister) => {
    e.preventDefault();
    if (credentials.password1 !== credentials.password2) {
      alert('Passwords do not match');
    }
    try {
      const response = await account.create(ID.unique(), credentials.email, credentials.password1, credentials.name);
      console.log('REGISTERED', response);
      await account.createEmailPasswordSession(credentials.email, credentials.password1);
      const accountDetails = await account.get();
      setUser(accountDetails);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserLogin = async (e: FormEvent, credentials: UserLogin) => {
    e.preventDefault();
    try {
      const response = await account.createEmailPasswordSession(credentials.email, credentials.password);
      console.log('LOGGED IN:', response);
      const accountDetails = await account.get();
      setUser(accountDetails);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserLogout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  const contextData = {
    user,
    handleUserLogin,
    handleUserLogout,
    handleUserRegister,
  };
  return <AuthContext.Provider value={contextData}>{loading ? <p>Loading...</p> : children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
