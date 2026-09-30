"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, Mail, User, Eye, EyeOff, CheckCircle2, 
  ArrowRight, Globe, ShieldCheck, Clock
} from "lucide-react";
import Link from "next/link";
import { getAssetUrl } from "@/lib/brandConfig";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F8FC] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#0da687] selection:text-white">

      {/* Outer Floating White Master Card on Marble Background */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_70px_rgba(27,43,90,0.09),0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden p-3 sm:p-4 lg:p-4 border border-slate-200/80 flex flex-col lg:flex-row">

        {/* ========================================================================= */}
        {/* LEFT PANEL: THE FLUID FINSOCAP GRADIENT CARD (MATCHING REFERENCE UI)      */}
        {/* HIDDEN ON MOBILE AS REQUESTED ("mobile me bas login form rahega")         */}
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
              Team Access Request
            </span>
          </div>

          {/* Center / Bottom Content */}
          <div className="relative z-10 space-y-6 pt-10">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xs">
              <span>Finsocap Team — Staff Only</span>
              <span>👥</span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Request Team<br />Access
              </h1>
              <p className="text-xs xl:text-sm text-white/80 font-normal max-w-sm leading-relaxed">
                Register your details to request dashboard access. An admin will review and approve your membership before you can sign in.
              </p>
            </div>

            {/* 3 Step Progress Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              
              {/* Step 1 */}
              <div className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between h-28 xl:h-32 transition-transform hover:-translate-y-0.5">
                <div className="w-6 h-6 rounded-full bg-[#1b2b5a] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Register</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">staff details</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between h-28 xl:h-32 transition-all">
                <div className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center font-bold text-xs border border-white/20">
                  2
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Admin Review</span>
                  <span className="text-[10px] text-white/70 block leading-tight mt-0.5">team approval</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between h-28 xl:h-32 transition-all">
                <div className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center font-bold text-xs border border-white/20">
                  3
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Get Access</span>
                  <span className="text-[10px] text-white/70 block leading-tight mt-0.5">team dashboard</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: CLEAN MINIMAL REGISTER FORM (EXACT MATCH TO LOGIN THEME)     */}
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
              Request Access
            </span>
          </div>

          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="my-auto py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Request Submitted!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Aapka registration request submit ho chuka hai. Hamare administrator ke pass approval request bhej di gayi hai.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 max-w-sm mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Registered Email:</span>
                  <span className="font-mono font-bold text-slate-900">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Pending Admin Approval
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 leading-normal">
                  💡 Note: Admin approve karte hi aap is email se dashboard login kar payenge.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/login"
                  className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] hover:opacity-95 text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1b2b5a]/20"
                >
                  <span>Go to Sign In Page</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Top Form Header */}
              <div className="space-y-1 text-center sm:text-center pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Request Team Access
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Fill in your details — your request will be reviewed by an admin before login is granted.
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="my-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5 my-5">
                
                {/* Full Name Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                    placeholder="e.g. Aarav Sharma"
                    autoComplete="name"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                    placeholder="name@finsocap.com"
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Confirm Password
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
                  <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                    Access requires admin review and approval before login is enabled.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] hover:opacity-95 text-white text-sm font-black transition-all active:scale-[0.98] shadow-lg shadow-[#1b2b5a]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit Access Request &rarr;</span>
                    )}
                  </button>
                </div>

              </form>

              {/* Under Button Links */}
              <div className="space-y-3 text-center">
                
                <p className="text-xs text-slate-500 font-medium">
                  Already a team member?{" "}
                  <Link href="/dashboard/login" className="text-[#1b2b5a] hover:text-[#0da687] font-bold hover:underline transition-colors">
                    Team Sign In
                  </Link>
                </p>

                {/* Divider "Or" */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
                    Or
                  </span>
                </div>

                {/* Return to Public Website */}
                <Link
                  href="/"
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs group"
                >
                  <Globe className="w-4 h-4 text-slate-400 group-hover:text-[#0da687] transition-colors" />
                  <span>Return to Public Website</span>
                </Link>

                {/* Legal */}
                <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                  By registering you agree to Finsocap&apos;s{" "}
                  <Link href="/terms-of-use" className="text-slate-600 font-semibold hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-slate-600 font-semibold hover:underline">
                    Privacy Policy
                  </Link>.
                </p>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
