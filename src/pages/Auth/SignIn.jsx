import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const SignIn = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      navigate('/customer-app', { replace: true });
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      const role = snap.exists() ? snap.data()?.role : null;
      const isDashboardRole = role === 'owner' || role === 'admin' || role === 'staff';
      navigate(isDashboardRole ? '/dashboard' : '/customer-app', { replace: true });
    } catch (_) {
      navigate('/customer-app', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      await redirectAfterLogin();
    } catch (err) {
      setError('Failed to sign in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      await redirectAfterLogin();
    } catch (err) {
      setError('Failed to sign in with Google: ' + err.message);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-background font-body-md text-on-background">
      {/* Left Side: Branding & Illustration */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-primary overflow-hidden relative items-center justify-center p-container-padding">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-container/30 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="mb-section-margin">
            <img 
              alt="Antreey Brand Visual" 
              className="rounded-[40px] shadow-2xl border-4 border-primary-container/20 aspect-video object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ7bZ3DE7LRBEnvJgPTTRpzly6DmHlAxO4ZcCd0hpvaIOdtxQtm0mgsxss0kuUbbJMbVM9rCHRalj7XAOFTga1BGk3XaxBX7ECOugawQmQqR_izXgHGMeLhVbTXTtDogLVk1q2FFi07-P5yi8OZ-qYX9elBwV7UmqjsM7Rb0aafPvQ6cv2b2RVrGAI-jBmXiJh-cD9wB710ucw-eF9HeQZO15bgrB2WstsBikpBCdvDIz7WRO7FJgJO499sbKVdzyXHngoOre82jYB" 
            />
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-primary mb-unit">Antreey</h1>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim px-gutter opacity-90">
            Streamline your professional bookings with translucent clarity and modern precision.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="flex-1 flex flex-col items-center justify-center p-gutter md:p-container-padding bg-surface">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-section-margin">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-unit">
              <span className="material-symbols-outlined text-on-primary text-3xl">calendar_today</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Antreey</h2>
          </div>

          <div className="mb-section-margin">
            <h3 className="font-headline-xl text-headline-xl text-on-surface mb-unit">Welcome back</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Please enter your details to sign in.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm">{error}</div>}

          {/* Form Section */}
          <form className="space-y-gutter" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline-variant outline-none" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline-variant outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors" type="button">
                  <span className="material-symbols-outlined">visibility_off</span>
                </button>
              </div>
            </div>

            {/* Helpers */}
            <div className="flex items-center justify-between py-unit">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container" type="checkbox" />
                <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
              </label>
              <a className="font-label-md text-label-md text-primary hover:text-on-primary-container transition-colors" href="#">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-4 rounded-full shadow-md hover:shadow-lg hover:bg-inverse-primary active:scale-[0.98] transition-all duration-200 uppercase tracking-wide disabled:opacity-50" 
              type="submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-section-margin">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant opacity-30"></span>
            </div>
            <div className="relative flex justify-center text-label-sm text-label-sm">
              <span className="px-gutter bg-surface text-on-surface-variant">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-gutter">
            <button 
              onClick={handleGoogle}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface-variant disabled:opacity-50"
            >
              <img 
                alt="Google" 
                className="w-5 h-5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7yh-S_4vPaGw0qMwVMTkHMsr3BsqRdU1JZRGR4kPnIPcPma6dDfRceFl7T8YsqBG0lYaAq-tl5sVanS5aGzHJ3ALwhQlisDcOxF0gUtfgvCZuSvn3PKeOW_jiI8OvyHs4qBWBRIedFrVEqirwR39NI-b1Mvh8TotmQmPHYot02lQ3UEWctJ849q3zL2pNz7WcndcddV32bR6VCz0MAG3E-wZ2D7ZaWSWHcXMsDoXOQJn9eXSQjHdPuiaJZ2lCsOmU9qjy43OUvyYy" 
              />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
              Apple
            </button>
          </div>

          {/* Footer Link */}
          <p className="mt-section-margin text-center font-body-md text-body-md text-on-surface-variant">
            Don't have an account? 
            <button type="button" className="text-primary font-label-md hover:underline decoration-2 underline-offset-4 ml-1 transition-all cursor-pointer" onClick={() => navigate('/signup')}>Create an account</button>
          </p>
        </div>
      </section>
    </main>
  );
};
