import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';



const SignUp = () => {

  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'phone'>('email');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get('role');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const cleanUsername = (username || '').trim().toLowerCase();
    const res: any = await signUp(cleanUsername, email, password, fullName, phone, twoFactorEnabled, twoFactorMethod, roleHint || undefined, vehicleNumber || undefined, vehicleType || undefined);
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

    toast.success('Account created! You can now log in.');
    navigate('/login');
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
      // store token and navigate
      localStorage.setItem('auth_token', data.token);
      toast.success('Two-factor verification successful');
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
            {roleHint ? <div className="text-sm text-muted-foreground">Signing up as: <strong>{roleHint}</strong></div> : null}
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Sign up as a {roleHint || 'resident'}</p>
        </div>

        <form onSubmit={twoFactorRequired ? handleVerify : handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
            />
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+220 123 4567"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="twoFactorEnabled"
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            />
            <Label htmlFor="twoFactorEnabled">Enable two-factor authentication</Label>
          </div>

          {twoFactorEnabled && (
            <div>
              <Label htmlFor="twoFactorMethod">2FA Method</Label>
              <select
                id="twoFactorMethod"
                value={twoFactorMethod}
                onChange={(e) => setTwoFactorMethod(e.target.value as 'email' | 'phone')}
                className="w-full rounded-md border p-2"
              >
                <option value="email">Email</option>
                <option value="phone">Phone (SMS)</option>
              </select>
            </div>
          )}


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

          {roleHint === 'collector' && (
            <>
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number (optional)</Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="GW-1234"
                />
              </div>
              <div>
                <Label htmlFor="vehicleType">Vehicle Type (optional)</Label>
                <Input
                  id="vehicleType"
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="Truck, Van, etc."
                />
              </div>
            </>
          )}

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

          {!twoFactorRequired && (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
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
            Already have an account?{' '}
            <Link to={`/login?role=${roleHint || 'resident'}`} className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
