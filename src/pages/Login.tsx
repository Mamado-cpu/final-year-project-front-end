import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const { signIn, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get('role');

  useEffect(() => {
    if (user && userRole) {
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'collector':
          navigate('/collector');
          break;
        case 'resident':
          navigate('/resident');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res: any = await signIn(email, password);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error.message);
      return;
    }

    if (res?.twoFactorRequired) {
      setTwoFactorRequired(true);
      setTempToken(res.tempToken || null);
      toast.info('Two-factor code sent — check your email or phone');
      return;
    }

    toast.success('Logged in successfully!');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !tempToken) return toast.error('Enter the verification code');
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return toast.error(data.message || 'Verification failed');
      // store token and refresh
      localStorage.setItem('auth_token', data.token);
      toast.success('Two-factor verification successful');
      // reload to let AuthProvider pick up /auth/me
      window.location.href = '/';
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (!tempToken) return toast.error('No pending verification');
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/auth/resend-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Could not resend code');
      setTempToken(data.tempToken || tempToken);
      toast.success('Verification code resent');
      setResendCountdown(60);
    } catch (err: any) {
      toast.error(err.message || 'Could not resend code');
    }
  };

  // countdown effect
  useEffect(() => {
    if (!resendCountdown) return;
    const t = setInterval(() => setResendCountdown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
            {roleHint ? <div className="text-sm text-muted-foreground">Login as: <strong>{roleHint}</strong></div> : null}
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Login to SmartWaste</p>
        </div>

        <form onSubmit={twoFactorRequired ? handleVerify : handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          {!twoFactorRequired && (
            <>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </>
          )}

          {twoFactorRequired && (
            <>
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>

              <div className="mt-2 flex items-center justify-center gap-2">
                <Button variant="ghost" onClick={handleResend} disabled={resendCountdown > 0}>
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to={`/signup?role=${roleHint || 'resident'}`} className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
