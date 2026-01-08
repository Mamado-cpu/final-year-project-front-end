import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  initializeMockData, 
  getMockUsers, 
  setMockUsers, 
  getCurrentUser, 
  setCurrentUser,
  MockUser 
} from '@/lib/mockData';

interface AuthContextType {
  user: MockUser | null;
  session: any | null;
  userRole: string | null;
  isApproved: boolean;
  loading: boolean;
  signUp:
   (username: string,
    email: string, 
    password: string, 
    fullName: string, 
    phone: string, 
    twoFactorEnabled?: boolean, 
    twoFactorMethod?: string,
    role?: string,
    vehicleNumber?: string,
    vehicleType?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize mock data
    initializeMockData();
    
    // Check for existing session
    const token = localStorage.getItem('auth_token');
      if (token) {
      // try to load user from backend
      api.get('/auth/me')
        .then((res) => {
          const u = res.data;
          setUser(u);
          setCurrentUser(u as any);
          setSession({ user: u });
          const chooseRole = (roles: string[] | undefined | null) => {
            if (!roles || !roles.length) return null;
            if (roles.includes('admin')) return 'admin';
            if (roles.includes('collector')) return 'collector';
            if (roles.includes('resident')) return 'resident';
            return roles[0] || null;
          };
          setUserRole(chooseRole(u.roles));
          setIsApproved(u.isApproved || false);
        })
        .catch(() => {
          // fallback to mock current user
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setSession({ user: currentUser });
            setUserRole(currentUser.role || null);
            setIsApproved(currentUser.isApproved);
          }
        });
    } else {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setSession({ user: currentUser });
          setUserRole(currentUser.role || null);
        setIsApproved(currentUser.isApproved);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (username: string, email: string, password: string, fullName: string, phone: string, twoFactorEnabled = false, twoFactorMethod?: string, role?: string, vehicleNumber?: string, vehicleType?: string) => {
    try {
      const payload: any = { 
        username, 
        email, 
        password, 
        fullName, 
        phone ,
        role
      };
      if (role) payload.role = role;
      if (vehicleNumber) payload.vehicleNumber = vehicleNumber;
      if (vehicleType) payload.vehicleType = vehicleType;
      if (twoFactorEnabled) payload.twoFactorEnabled = true;
      if (twoFactorMethod) payload.twoFactorMethod = twoFactorMethod;
      const res = await api.post('/auth/register', payload);
      // If backend requires 2FA, return that info to the caller
      if (res.data?.twoFactorRequired) {
        return { error: null, twoFactorRequired: true, tempToken: res.data.tempToken };
      }
      // backend returns token and user
        if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        const u = res.data.user;
        setUser(u);
          setCurrentUser(u as any);
        setSession({ user: u });
        const chooseRole = (roles: string[] | undefined | null) => {
          if (!roles || !roles.length) return null;
          if (roles.includes('admin')) return 'admin';
          if (roles.includes('collector')) return 'collector';
          if (roles.includes('resident')) return 'resident';
          return roles[0] || null;
        };
        setUserRole(chooseRole(u.roles));
        setIsApproved(u.isApproved || false);
      }
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.response?.data?.message || err.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.twoFactorRequired) {
        return { error: null, twoFactorRequired: true, tempToken: res.data.tempToken };
      }
      const token = res.data?.token;
      const u = res.data?.user;
      if (token) localStorage.setItem('auth_token', token);
      if (u) {
        setUser(u);
        setSession({ user: u });
        const chooseRole = (roles: string[] | undefined | null) => {
          if (!roles || !roles.length) return null;
          if (roles.includes('admin')) return 'admin';
          if (roles.includes('collector')) return 'collector';
          if (roles.includes('resident')) return 'resident';
          return roles[0] || null;
        };
        setUserRole(chooseRole(u.roles));
        setIsApproved(u.isApproved || false);
        setCurrentUser(u as any);
      } else if (token) {
        // fetch user
        const me = await api.get('/auth/me');
        setUser(me.data);
        setSession({ user: me.data });
        const chooseRole = (roles: string[] | undefined | null) => {
          if (!roles || !roles.length) return null;
          if (roles.includes('admin')) return 'admin';
          if (roles.includes('collector')) return 'collector';
          if (roles.includes('resident')) return 'resident';
          return roles[0] || null;
        };
        setUserRole(chooseRole(me.data.roles));
        setIsApproved(me.data.isApproved || false);
        setCurrentUser(me.data as any);
      }
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.response?.data?.message || err.message } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsApproved(false);
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, isApproved, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
