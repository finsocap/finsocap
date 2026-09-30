"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, ShieldCheck, KeyRound, Save, AlertCircle, 
  CheckCircle2, Eye, EyeOff, BadgeCheck, Camera, Trash2
} from "lucide-react";
import { mockCurrentUser } from "@/lib/mockData";
import { defaultBrandConfig } from "@/lib/brandConfig";

export default function SettingsPage() {
  const { data: session } = useSession();

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Profile & Security State
  const [profileName, setProfileName] = useState(mockCurrentUser.name);
  const [profileEmail, setProfileEmail] = useState(mockCurrentUser.email);
  const [profileRole, setProfileRole] = useState(mockCurrentUser.role);
  const [memberSince] = useState("1 January 2025");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userDp, setUserDp] = useState<string | null>(mockCurrentUser.image || null);

  // Load DP & Profile from localStorage or mock session on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("finsocap_profile_data");
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.name) setProfileName(p.name);
        if (p.email) setProfileEmail(p.email);
        if (p.role) setProfileRole(p.role);
        if (p.image) setUserDp(p.image);
      } else if (session?.user) {
        if (session.user.name) setProfileName(session.user.name);
        if (session.user.email) setProfileEmail(session.user.email);
        if ((session.user as any).role) setProfileRole((session.user as any).role);
        if (session.user.image) setUserDp(session.user.image);
      }

      const savedDp = localStorage.getItem("finsocap_user_dp");
      if (savedDp) setUserDp(savedDp);
    } catch (err) {}

    const handleDpStorage = () => {
      try {
        const saved = localStorage.getItem("finsocap_user_dp");
        if (saved) setUserDp(saved);
      } catch (err) {}
    };
    window.addEventListener("user-dp-updated", handleDpStorage);
    window.addEventListener("storage", handleDpStorage);
    return () => {
      window.removeEventListener("user-dp-updated", handleDpStorage);
      window.removeEventListener("storage", handleDpStorage);
    };
  }, [session]);

  const handleDpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setUserDp(dataUrl);

          try {
            localStorage.setItem("finsocap_user_dp", dataUrl);
            const savedProfile = localStorage.getItem("finsocap_profile_data");
            const p = savedProfile ? JSON.parse(savedProfile) : { ...mockCurrentUser };
            p.image = dataUrl;
            localStorage.setItem("finsocap_profile_data", JSON.stringify(p));
            window.dispatchEvent(new Event("user-dp-updated"));
          } catch (err) {}

          showToast("Profile display picture (DP) updated successfully!");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDp = async () => {
    setUserDp(null);
    try {
      localStorage.removeItem("finsocap_user_dp");
      const savedProfile = localStorage.getItem("finsocap_profile_data");
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        p.image = null;
        localStorage.setItem("finsocap_profile_data", JSON.stringify(p));
      }
      window.dispatchEvent(new Event("user-dp-updated"));
    } catch (err) {}
    showToast("Profile display photo removed.");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError("New password and confirm password do not match.");
      return;
    }

    if (newPassword && !currentPassword) {
      setProfileError("Please enter your current password to set a new password.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileError("New password must be at least 6 characters long.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedProfile = {
        ...mockCurrentUser,
        name: profileName,
        email: profileEmail,
        image: userDp,
        role: profileRole,
      };
      localStorage.setItem("finsocap_profile_data", JSON.stringify(updatedProfile));
      if (userDp) {
        localStorage.setItem("finsocap_user_dp", userDp);
      }
      window.dispatchEvent(new Event("user-dp-updated"));

      showToast("Profile & security settings updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1b2b5a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HERO BANNER */}
      <div 
        style={{
          background: `linear-gradient(135deg, ${defaultBrandConfig.colors.primary} 0%, ${defaultBrandConfig.colors.primaryHover} 50%, ${defaultBrandConfig.colors.accent} 100%)`,
        }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 pointer-events-none blur-2xl" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Account &amp; Security Settings</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Profile &amp; Security Settings
          </h1>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            Manage your personal administrative profile, display picture, and login credentials.
          </p>
        </div>

        {/* User Pill Badge */}
        <div className="relative z-10 flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl">
          {userDp ? (
            <img
              src={userDp}
              alt="Profile DP"
              className="w-10 h-10 rounded-xl object-cover border border-white/40 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black text-sm shadow-sm">
              {profileName ? profileName.charAt(0).toUpperCase() : "A"}
            </div>
          )}
          <div>
            <p className="text-xs font-black text-white leading-tight">{profileName || "Admin User"}</p>
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">{profileRole}</p>
          </div>
        </div>
      </div>

      {/* PROFILE & SECURITY CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Profile Summary Card */}
        <div className="bg-white dark:bg-[#0c1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="text-center space-y-3">
            {/* DP Avatar with Camera Upload Badge */}
            <div className="relative w-24 h-24 mx-auto">
              {userDp ? (
                <img
                  src={userDp}
                  alt={profileName || "User"}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg border-2 border-indigo-200 ring-4 ring-indigo-50 dark:ring-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-500 to-emerald-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/20">
                  {profileName ? profileName.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              <label
                title="Upload / Change Profile DP"
                className="absolute -bottom-1 -right-1 p-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl shadow-md cursor-pointer transition-all border-2 border-white dark:border-slate-900 flex items-center justify-center hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDpUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* DP Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl cursor-pointer transition-colors border border-teal-200 dark:border-teal-800 shadow-2xs">
                <Camera className="w-3.5 h-3.5" />
                <span>{userDp ? "Change DP" : "Upload DP"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDpUpload}
                  className="hidden"
                />
              </label>
              {userDp && (
                <button
                  type="button"
                  onClick={handleRemoveDp}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900"
                  title="Remove custom DP and use initials"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{profileName || "Aarav Jha"}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profileEmail}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>{profileRole} Privileges</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Account ID:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">ADM-88210</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Organization:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{defaultBrandConfig.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Registered on:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{memberSince}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your profile is verified with active administrator credentials and editorial privileges.
            </span>
          </div>
        </div>

        {/* Right: Update Form (Name, Email, Password) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <User className="w-4 h-4 text-teal-600" /> Edit Profile &amp; Security Credentials
          </h2>

          {profileError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="e.g. Aarav Jha"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Login Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  placeholder="e.g. aarav@finsocap.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 text-xs font-bold"
                />
              </div>
            </div>

            {/* Security & Password Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-teal-600" /> Change Account Password
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Leave these fields blank if you do not wish to change your current password.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Current Password (Required only if changing password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      New Password (Min 6 characters)
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="New secure password"
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 bg-[#1b2b5a] hover:bg-[#243b78] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{isSavingProfile ? "Updating Profile..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
