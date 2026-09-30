"use client";

import { useState } from "react";
import { 
  Lock, Mail, KeyRound, Eye, EyeOff, CheckCircle2, 
  ArrowRight, ArrowLeft, Globe, ShieldCheck, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { getAssetUrl } from "@/lib/brandConfig";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_OTP", email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP code.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "OTP sent successfully! Please check your email inbox.");
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "RESET_PASSWORD", 
          email, 
          otp, 
          newPassword 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password reset failed.");
        setLoading(false);
        return;
      }

      setStep(3);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F8FC] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#0da687] selection:text-white">

      {/* Outer Floating White Master Card */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_70px_rgba(27,43,90,0.09),0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden p-3 sm:p-4 lg:p-4 border border-slate-200/80 flex flex-col lg:flex-row">

        {/* ========================================================================= */}
        {/* LEFT PANEL: THE FLUID FINSOCAP GRADIENT CARD                              */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:w-[52%] rounded-[28px] sm:rounded-[34px] p-8 xl:p-10 flex-col justify-between relative overflow-hidden text-white select-none auth-gradient-panel">

          {/* Ambient Diffused White / Cyan Light Mix in Gradient */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/25 blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-cyan-300/15 blur-2xl pointer-events-none" />

          {/* Top: Minimal Pure White Logo & Brand */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform hover:opacity-90">
              <img 
                src={getAssetUrl("/white_logo.png")} 
                onError={(e: any) => {
                  e.currentTarget.src = getAssetUrl("/white_logo.svg");
                }}
                alt="Finsocap" 
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-sm"
              />
            </Link>

            <span className="text-[11px] font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/15">
              Team Account Recovery
            </span>
          </div>

          {/* Center Content */}
          <div className="relative z-10 space-y-6 pt-10">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xs">
              <span>Finsocap Team — Staff Access</span>
              <span>🔒</span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Recover Your<br />Team Access
              </h1>
              <p className="text-xs xl:text-sm text-white/80 font-normal max-w-sm leading-relaxed">
                Verify your registered staff email to securely reset your password and regain access to the Finsocap team workspace.
              </p>
            </div>

            {/* 3 Step Progress Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              
              {/* Step 1 */}
              <div className={`${step === 1 ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/15 text-white border border-white/20'} rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-28 xl:h-32 transition-all`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-[#1b2b5a] text-white' : 'bg-white/25 text-white'}`}>
                  1
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Enter Email</span>
                  <span className={`text-[10px] block leading-tight mt-0.5 ${step === 1 ? 'text-slate-500' : 'text-white/70'}`}>receive OTP</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`${step === 2 ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/15 text-white border border-white/20'} rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-28 xl:h-32 transition-all`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-[#1b2b5a] text-white' : 'bg-white/25 text-white'}`}>
                  2
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Verify OTP</span>
                  <span className={`text-[10px] block leading-tight mt-0.5 ${step === 2 ? 'text-slate-500' : 'text-white/70'}`}>6-digit code</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`${step === 3 ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/15 text-white border border-white/20'} rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-28 xl:h-32 transition-all`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 3 ? 'bg-[#1b2b5a] text-white' : 'bg-white/25 text-white'}`}>
                  3
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Complete</span>
                  <span className={`text-[10px] block leading-tight mt-0.5 ${step === 3 ? 'text-slate-500' : 'text-white/70'}`}>new password</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: FORMS                                                        */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[48%] p-6 sm:p-10 xl:p-12 flex flex-col justify-between">

          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 mb-2 border-b border-slate-100">
            <Link href="/" className="inline-flex items-center gap-2">
              <img 
                src={getAssetUrl("/Finsocap_logo.png")} 
                alt="Finsocap Logo" 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Team Account Recovery
            </span>
          </div>

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 3 ? (
            <div className="my-auto py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Password Updated!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                Your new password has been set. You can now sign in to the Finsocap team workspace with your updated credentials.
              </p>
              </div>

              <div className="pt-4 max-w-sm mx-auto">
                <Link
                  href="/dashboard/login"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] hover:opacity-95 text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1b2b5a]/20"
                >
                  <span>Team Sign In &rarr;</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */
            <div className="space-y-4 my-auto animate-in fade-in duration-200">
              <div className="space-y-1 text-center pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Enter OTP &amp; Reset
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  A 6-digit code was sent to your team email <span className="font-bold text-slate-800">{email}</span>
                </p>
              </div>

              {message && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3.5 my-4">
                
                {/* OTP Code */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    6-Digit Email OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-center font-mono font-bold text-lg tracking-[8px] focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                    placeholder="••••••"
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                    <span>Valid for 15 minutes</span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#0da687] hover:underline font-bold"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                  />
                </div>

                {/* Submit Reset Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] hover:opacity-95 text-white text-sm font-black transition-all active:scale-[0.98] shadow-lg shadow-[#1b2b5a]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <span>Update Password &rarr;</span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    &larr; Change Email Address
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* STEP 1: ENTER EMAIL TO RECEIVE OTP */
            <div className="space-y-4 my-auto animate-in fade-in duration-200">
              <div className="space-y-1 text-center pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter your registered team email to receive a one-time verification code.
              </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4 my-5">
                
                {/* Email Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Registered Team Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                    placeholder="yourname@finsocap.com"
                    autoComplete="email"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                    A 6-digit OTP will be sent to your registered staff email address.
                  </p>
                </div>

                {/* Send OTP Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] hover:opacity-95 text-white text-sm font-black transition-all active:scale-[0.98] shadow-lg shadow-[#1b2b5a]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Send Verification Code &rarr;</span>
                    )}
                  </button>
                </div>

              </form>

              {/* Back to Login */}
              <div className="pt-4 text-center border-t border-slate-100">
                <Link
                  href="/dashboard/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#1b2b5a] hover:text-[#0da687] font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Team Sign In</span>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Footer Note */}
          <div className="pt-6 text-center text-[10px] text-slate-400">
            Finsocap Operations • Protected by 256-bit SSL encryption
          </div>

        </div>

      </div>

    </div>
  );
}
