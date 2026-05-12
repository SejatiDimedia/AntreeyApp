import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRepository } from '../../repositories/UserRepository';
import { BusinessRepository } from '../../repositories/BusinessRepository';

export const SignUp = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(email, password);
      
      // Save profile
      await UserRepository.saveUserProfile(userCredential.user.uid, {
        name,
        email,
        role: 'owner' // default role for now
      });
      
      // Create a default business for the new owner
      const business = await BusinessRepository.createBusiness({
        name: `${name}'s Business`,
        ownerId: userCredential.user.uid,
        address: 'Set your address',
        category: 'Other',
        createdAt: new Date().toISOString()
      });

      // Add one default service
      await BusinessRepository.addService(business.id, {
        name: 'General Consultation',
        price: 50000,
        duration: 30,
        description: 'Default service'
      });

      // Add the owner as first staff member
      await BusinessRepository.addStaff(business.id, {
        name: name,
        role: 'Owner',
        isAvailable: true
      });
      
      navigate('/');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
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
          <h1 className="font-headline-xl text-headline-xl text-on-primary mb-unit">Join Antreey</h1>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim px-gutter opacity-90">
            Start managing your business queues smartly and efficiently today.
          </p>
        </div>
      </section>

      {/* Right Side: Register Form */}
      <section className="flex-1 flex flex-col items-center justify-center p-gutter md:p-container-padding bg-surface overflow-y-auto">
        <div className="w-full max-w-[440px] my-auto py-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-section-margin">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-unit">
              <span className="material-symbols-outlined text-on-primary text-3xl">calendar_today</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Antreey</h2>
          </div>

          <div className="mb-section-margin">
            <h3 className="font-headline-xl text-headline-xl text-on-surface mb-unit">Create Account</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign up to get started with smart queuing.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm">{error}</div>}

          {/* Form Section */}
          <form className="space-y-gutter" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="name">Business / Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">storefront</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline-variant outline-none" 
                  id="name" 
                  placeholder="Your business name" 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
            <div className="flex items-start py-unit">
              <label className="flex items-start space-x-2 cursor-pointer group">
                <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container mt-0.5" type="checkbox" />
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-4 rounded-full shadow-md hover:shadow-lg hover:bg-inverse-primary active:scale-[0.98] transition-all duration-200 uppercase tracking-wide disabled:opacity-50" 
              type="submit"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-section-margin text-center font-body-md text-body-md text-on-surface-variant">
            Already have an account? 
            <button type="button" className="text-primary font-label-md hover:underline decoration-2 underline-offset-4 ml-1 transition-all cursor-pointer" onClick={() => navigate('/signin')}>Sign in</button>
          </p>
        </div>
      </section>
    </main>
  );
};
