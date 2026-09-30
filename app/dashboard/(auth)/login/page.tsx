"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft,
  Check, Globe, ShieldCheck, ShieldAlert, X, AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotApprovedModal, setShowNotApprovedModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userSession = {
        user: {
          id: "admin-aarav",
          name: email.split("@")[0] ? email.split("@")[0].toUpperCase() : "Admin",
          email: email || "admin@finsocap.com",
          role: "ADMIN",
          status: "APPROVED",
        },
        expires: "2099-01-01T00:00:00.000Z",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("finsocap_user_session", JSON.stringify(userSession));
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 200);
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
        {/* LEFT PANEL: THE FLUID FINSOCAP GRADIENT CARD (MATCHING REFERENCE IMAGE)     */}
        {/* HIDDEN ON MOBILE AS REQUESTED ("mobile me bas login form rahega")         */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:w-[54%] rounded-[28px] sm:rounded-[34px] p-8 xl:p-10 flex-col justify-between relative overflow-hidden text-white select-none auth-gradient-panel">

          {/* Ambient Diffused White / Cyan Light Mix in Gradient */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/25 blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-cyan-300/15 blur-2xl pointer-events-none" />

          {/* Top: Minimal Pure White Logo & Brand */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform hover:opacity-90">
              <img 
                src="/white_logo.png" 
                onError={(e: any) => {
                  e.currentTarget.src = "/white_logo.svg";
                }}
                alt="Finsocap" 
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-sm"
              />
            </Link>

            <span className="text-[11px] font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/15">
              Team Portal
            </span>
          </div>

          {/* Center / Bottom Content (Matching Reference Layout & Typography) */}
          <div className="relative z-10 space-y-6 pt-12">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xs">
              <span>Finsocap Internal Team Portal</span>
              <span>🔒</span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Welcome Back,<br />Team Finsocap
              </h1>
              <p className="text-xs xl:text-sm text-white/80 font-normal max-w-sm leading-relaxed">
                Authorized staff members can access their workspace, manage clients, leads, and team operations.
              </p>
            </div>

            {/* 3 Step Feature Cards — what team gets access to */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              
              {/* Card 1 (Active Solid White — Step focused) */}
              <div className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between h-28 xl:h-32 transition-transform hover:-translate-y-0.5">
                <div className="w-6 h-6 rounded-full bg-[#1b2b5a] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Team Sign In</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">staff only access</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between h-28 xl:h-32 transition-all">
                <div className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center font-bold text-xs border border-white/20">
                  2
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Manage Work</span>
                  <span className="text-[10px] text-white/70 block leading-tight mt-0.5">clients &amp; leads</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 border border-white/20 flex flex-col justify-between h-28 xl:h-32 transition-all">
                <div className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center font-bold text-xs border border-white/20">
                  3
                </div>
                <div>
                  <span className="text-xs font-black block leading-snug">Team Tools</span>
                  <span className="text-[10px] text-white/70 block leading-tight mt-0.5">tasks &amp; reports</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: CLEAN MINIMAL SIGN IN FORM (EXACT MATCH TO REFERENCE IMAGE)  */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[46%] p-6 sm:p-10 xl:p-12 flex flex-col justify-between">

          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 mb-2 border-b border-slate-100">
            <Link href="/" className="inline-flex items-center gap-2">
              <img 
                src="/Finsocap_logo.png" 
                alt="Finsocap Logo" 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Team Sign In
            </span>
          </div>

          {/* Top Form Header */}
          <div className="space-y-1 text-center sm:text-center pt-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Team Sign In
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Finsocap staff only — enter your team credentials to access the workspace.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="my-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center animate-in fade-in">
              {error}
            </div>
          )}

          {/* Form Fields (Matching Reference Image Soft Inputs) */}
          <form onSubmit={handleSubmit} className="space-y-4 my-6">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                  placeholder="name@finsocap.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link 
                  href="/dashboard/forgot-password"
                  className="text-[11px] text-slate-400 hover:text-[#0da687] cursor-pointer transition-colors font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 sm:py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1b2b5a] focus:bg-white transition-all shadow-2xs"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
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

              <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                At least 6 characters. Protected by 256-bit encryption.
              </p>
            </div>

            {/* Primary Action Button (Matching Reference Image "Continue" Button) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] hover:opacity-95 text-white text-sm font-black transition-all active:scale-[0.98] shadow-lg shadow-[#1b2b5a]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </div>

            {/* 1-Click Local Dev Login */}
            {process.env.NODE_ENV !== "production" && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("aarav@finsocap.com");
                    setPassword("admin123");
                    setLoading(true);
                    const userSession = {
                      user: {
                        id: "admin-aarav",
                        name: "Aarav Jha",
                        email: "aarav@finsocap.com",
                        role: "ADMIN",
                        status: "APPROVED",
                      },
                      expires: "2099-01-01T00:00:00.000Z",
                    };
                    if (typeof window !== "undefined") {
                      localStorage.setItem("finsocap_user_session", JSON.stringify(userSession));
                    }
                    setTimeout(() => {
                      router.push("/dashboard");
                    }, 200);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>⚡ 1-Click Login (Aarav Jha - Admin)</span>
                </button>
              </div>
            )}

          </form>

          {/* Under Button Links (Matching Reference UI) */}
          <div className="space-y-4 text-center">
            
            <p className="text-xs text-slate-500 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/dashboard/register" className="text-[#1b2b5a] hover:text-[#0da687] font-bold hover:underline transition-colors">
                Register
              </Link>
            </p>

            {/* Divider "Or" */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
                Or
              </span>
            </div>

            {/* Alternative Button (Return to Website) */}
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs group"
            >
              <Globe className="w-4 h-4 text-slate-400 group-hover:text-[#0da687] transition-colors" />
              <span>Return to Public Website</span>
            </Link>

            {/* Legal / Policy Line (Matching Reference Bottom Text) */}
            <p className="text-[10px] text-slate-400 leading-relaxed pt-2">
              By signing in I confirm that I carefully have read and agree to the Finsocap{" "}
              <Link href="/privacy-policy" className="text-slate-600 font-semibold hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-use" className="text-slate-600 font-semibold hover:underline">
                Terms of Service
              </Link>.
            </p>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: ADMIN NOT ACCEPTED REQUEST (AS REQUESTED BY USER)            */}
      {/* ========================================================================= */}
      {showNotApprovedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 text-center">
            
            <button 
              type="button"
              onClick={() => setShowNotApprovedModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">
              Admin Not Accepted Your Request
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Aapka registration request submit ho chuka hai, lekin administrator ne abhi tak aapka account accept/approve nahi kiya hai. Jab admin approve karenge, tabhi aap dashboard me login kar payenge.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-600 mb-5 text-left space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500 text-[11px]">Account Email:</span>
                <span className="font-mono text-slate-900 font-bold text-[11px] truncate max-w-[200px]">{email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500 text-[11px]">Approval Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Admin Approval
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowNotApprovedModal(false)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#1b2b5a] to-[#243b78] hover:opacity-95 text-white font-bold text-sm transition-all shadow-md active:scale-[0.98]"
              >
                Theek Hai / Understood
              </button>
              <a
                href="mailto:care@finsocap.com?subject=Finsocap%20Account%20Approval%20Inquiry"
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold py-1.5 transition-colors"
              >
                Contact Support (care@finsocap.com)
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
