import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { Mail, Eye, EyeOff, ArrowRight, Check, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export const SuperadminSignupPage: React.FC = () => {
  const { registerSuperadmin, navigate } = useRBAC();
  const { addToast } = useApp();

  // Form State matching Image exactly
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+977');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic Password Validation Checks
  const hasMinLength = password.length >= 12;
  const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please create a master password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);

    const fullName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');
    const fullPhone = `${phonePrefix} ${phoneNumber.trim()}`;

    try {
      const res = await registerSuperadmin(
        fullName,
        email.trim(),
        password,
        fullPhone,
        invitationCode.trim()
      );

      if (res.success) {
        setSuccessMsg(`Superadmin account initialized for ${fullName}. Redirecting to console...`);
        addToast('success', `Welcome, Superadmin ${fullName}!`);
        setTimeout(() => {
          navigate('/superadmin/dashboard');
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Superadmin account creation failed. Verify invitation code.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize superadmin account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex items-stretch font-sans text-slate-800">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Deep Pine Green (#24413E) Brand Panel (Matching Image Exactly) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#24413E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Brand Logo: Kalam Tech */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md p-2 flex items-center justify-center shrink-0">
              {/* Stylized Kalam Tech Logo Badge matching image */}
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-[13px] font-black tracking-tighter text-[#0F766E] leading-none">
                  KT
                </span>
                <span className="text-[6.5px] font-bold text-slate-700 tracking-tight leading-none mt-0.5">
                  Kalam Tech
                </span>
              </div>
            </div>
          </div>

          {/* Center Content: Headline, Subtitle, Mandala, Silhouette, and Stepper */}
          <div className="relative z-10 my-auto py-8 space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] text-white tracking-tight">
                Set up your<br />
                superadmin<br />
                account.
              </h1>
              <p className="text-xs sm:text-[13.5px] text-slate-200/90 max-w-sm leading-relaxed font-normal">
                Superadmin accounts are invitation-only. Ask an existing superadmin for an invitation code before you start.
              </p>
            </div>

            {/* Decorative Circular Mandala & Silhouette Illustration */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
              {/* Golden circular mandala backdrop */}
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-40 mix-blend-screen scale-110 pointer-events-none"
                style={{
                  backgroundImage: `url('/mandala.png')`,
                }}
              />

              {/* Silhouette graphic of collaborators/tech partners */}
              <div className="relative z-10 flex items-end justify-center gap-2">
                <svg viewBox="0 0 200 160" className="w-48 h-36 fill-[#142624] drop-shadow-lg opacity-90">
                  {/* Left figure */}
                  <circle cx="65" cy="45" r="16" />
                  <path d="M40 140 C40 90, 50 75, 65 75 C80 75, 90 90, 90 140 Z" />
                  <path d="M65 75 L105 105 L95 140" stroke="#142624" strokeWidth="8" strokeLinecap="round" />
                  
                  {/* Right figure */}
                  <circle cx="135" cy="50" r="15" />
                  <path d="M112 140 C112 95, 122 80, 135 80 C148 80, 158 95, 158 140 Z" />
                  <path d="M135 80 L95 105 L105 140" stroke="#142624" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* 3-Step Wizard Stepper (Matching Image exactly) */}
            <div className="space-y-4 pt-2">
              {/* Step 1: Active */}
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-full bg-white text-[#24413E] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  1
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-white tracking-wide">
                  Enter your details and invitation code
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3.5 opacity-80">
                <div className="w-7 h-7 rounded-full border border-white/40 text-white font-medium text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <span className="text-xs sm:text-[13px] font-normal text-slate-200">
                  Verify your email
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3.5 opacity-80">
                <div className="w-7 h-7 rounded-full border border-white/40 text-white font-medium text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <span className="text-xs sm:text-[13px] font-normal text-slate-200">
                  Turn on two-step verification
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Left Footer Notice */}
          <div className="relative z-10 pt-6 text-[11px] text-slate-300 font-normal tracking-wide">
            © 2026 Kalam Tech · <span className="font-mono font-medium text-teal-200">kalamkumar.com.np</span> · Authorized personnel only
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Pure White Form Panel (Matching Image Exactly)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center">
          <div className="w-full max-w-[540px] space-y-6">
            
            {/* Title */}
            <div>
              <h2 className="text-3xl sm:text-[34px] font-bold text-[#111827] tracking-tight">
                Create account
              </h2>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: First Name & Middle Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    First name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Krishn"
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Middle name
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] bg-white transition"
                  />
                </div>
              </div>

              {/* Row 2: Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Chy"
                  className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] bg-white transition"
                />
              </div>

              {/* Row 3: Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Email
                </label>
                <div className="relative rounded-lg border border-slate-200 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E] bg-white transition">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your gmail"
                    className="w-full pl-10 pr-3.5 py-3 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Row 4: Mobile Number with +977 Prefix Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Mobile number
                </label>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3 sm:col-span-3">
                    <input
                      type="text"
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className="w-full px-3 py-3 rounded-lg border border-slate-200 text-slate-900 font-medium text-center text-sm focus:outline-none focus:border-[#0F766E] bg-white"
                    />
                  </div>
                  <div className="col-span-9 sm:col-span-9">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Password
                  </label>
                  <div className="relative rounded-lg border border-slate-200 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E] bg-white">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="w-full pl-3.5 pr-10 py-3 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Confirm password
                  </label>
                  <div className="relative rounded-lg border border-slate-200 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E] bg-white">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-3.5 pr-10 py-3 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      aria-label="Toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Checklist (Matching image) */}
              <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${hasMinLength ? 'border-emerald-600 text-emerald-600 bg-emerald-50' : 'border-slate-400 text-transparent'}`}>
                    {hasMinLength ? '✓' : ''}
                  </span>
                  <span className={hasMinLength ? 'text-slate-800 font-medium' : 'text-slate-500'}>12+ characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${hasUpperLower ? 'border-emerald-600 text-emerald-600 bg-emerald-50' : 'border-slate-400 text-transparent'}`}>
                    {hasUpperLower ? '✓' : ''}
                  </span>
                  <span className={hasUpperLower ? 'text-slate-800 font-medium' : 'text-slate-500'}>Upper &amp; lower case</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${hasNumber ? 'border-emerald-600 text-emerald-600 bg-emerald-50' : 'border-slate-400 text-transparent'}`}>
                    {hasNumber ? '✓' : ''}
                  </span>
                  <span className={hasNumber ? 'text-slate-800 font-medium' : 'text-slate-500'}>A number</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${hasSymbol ? 'border-emerald-600 text-emerald-600 bg-emerald-50' : 'border-slate-400 text-transparent'}`}>
                    {hasSymbol ? '✓' : ''}
                  </span>
                  <span className={hasSymbol ? 'text-slate-800 font-medium' : 'text-slate-500'}>A symbol</span>
                </div>
              </div>

              {/* Invitation Code / Master Passcode */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Invitation Code
                  </label>
                </div>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Enter invitation code"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-teal-800 font-mono text-xs sm:text-sm focus:outline-none focus:border-[#0F766E] bg-white"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                  />
                  <span>
                    I agree to the <a href="/about" className="text-[#0F766E] font-semibold hover:underline">Terms of Service</a>,{' '}
                    <a href="/help" className="text-[#0F766E] font-semibold hover:underline">Privacy Policy</a> and the admin acceptable use policy.
                  </span>
                </label>
              </div>

              {/* Big CTA Button matching Image */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-lg bg-[#11695E] hover:bg-[#0D5B51] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Continue to email verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Link: Already have access? Sign in */}
            <div className="text-center text-xs text-slate-600 pt-3">
              Already have access?{' '}
              <button
                type="button"
                onClick={() => navigate('/superadmin/login')}
                className="text-[#0F766E] font-bold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
