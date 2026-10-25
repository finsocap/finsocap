"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  RotateCcw,
  Sparkles,
  Lock,
  Briefcase,
  Award,
  Layers,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  Check,
  Copy,
  Zap
} from "lucide-react";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import PageBanner from "@/components/Dashboard/PageBanner";
import TeamInfographic from "@/components/Charts/TeamInfographic";
import { useCrmStore, UserModel } from "@/lib/crmStore";
import { useToast } from "@/components/Global/ToastNotification";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";

export default function TeamPage() {
  const toast = useToast();
  const { users, tasks, addUser, updateUser, toggleUserStatus } = useCrmStore();

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "Active" | "Deactivated">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password visibility map (per user)
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("Accounting");
  const [formPhone, setFormPhone] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const showToast = (msg: string) => {
    toast.success(msg, "Success!");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleUserPasswordReveal = (userId: string | number) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [String(userId)]: !prev[String(userId)],
    }));
  };

  // Departments & Roles for filters
  const departments = useMemo(() => {
    const set = new Set(users.map((u) => u.dept));
    return Array.from(set);
  }, [users]);

  const roles = useMemo(() => {
    const set = new Set(users.map((u) => u.role));
    return Array.from(set);
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedDept !== "ALL" && u.dept !== selectedDept) return false;
      if (selectedRole !== "ALL" && u.role !== selectedRole) return false;
      if (selectedStatus !== "ALL" && u.status !== selectedStatus) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const skillsMatch = (u.skills || [u.skill]).some((sk) =>
          sk.toLowerCase().includes(q)
        );
        return (
          u.name.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          u.phone.toLowerCase().includes(q) ||
          skillsMatch
        );
      }
      return true;
    });
  }, [users, selectedDept, selectedRole, selectedStatus, search]);

  const handleToggle = (userId: string | number, name: string, currentStatus: string) => {
    toggleUserStatus(userId);
    showToast(
      `${name} is now ${currentStatus === "Active" ? "deactivated" : "reactivated"}.`
    );
  };

  const openEditUserModal = (user: UserModel) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email || `${user.name.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`);
    setFormPassword(user.password || "Password@123");
    setFormRole(user.role);
    setFormDept(user.dept);
    setFormPhone(user.phone);
    setSelectedSkills(user.skills && user.skills.length > 0 ? user.skills : [user.skill]);
    setIsEditModalOpen(true);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim()) return;

    addUser({
      name: formName.trim(),
      email: formEmail.trim() || `${formName.trim().toLowerCase().replace(/\s+/g, ".")}@finsocap.com`,
      password: formPassword.trim() || "Password@123",
      role: formRole.trim(),
      dept: formDept,
      skill: selectedSkills.length > 0 ? selectedSkills.join(", ") : "General Compliance",
      skills: selectedSkills.length > 0 ? selectedSkills : ["General Compliance"],
      phone: formPhone.trim() || "+91 98765 43210",
    });

    setIsAddModalOpen(false);
    resetForm();
    showToast(`Team member "${formName}" created successfully!`);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formName.trim() || !formRole.trim()) return;

    updateUser(editingUser.id, {
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword.trim(),
      role: formRole.trim(),
      dept: formDept,
      skill: selectedSkills.length > 0 ? selectedSkills.join(", ") : editingUser.skill,
      skills: selectedSkills.length > 0 ? selectedSkills : editingUser.skills,
      phone: formPhone.trim() || editingUser.phone,
    });

    setIsEditModalOpen(false);
    setEditingUser(null);
    resetForm();
    showToast(`Credentials and profile for ${formName} updated!`);
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("");
    setFormDept("Accounting");
    setFormPhone("");
    setSelectedSkills([]);
  };

  const availableSkillsList = [
    "GST Filing & Reconciliation",
    "ITR & Tax Audits",
    "MCA & ROC Filings",
    "FSSAI & Food Licensing",
    "Trademark & IP Protection",
    "Company Incorporation",
    "TDS & Payroll",
    "Import Export Code (IEC)",
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* 1. Header (Official Finsocap Theme) */}
      <PageBanner
        icon={ShieldCheck}
        badge="Workforce & Capacity Cloud"
        badgeMeta="Role-Based Access Control"
        title="Team & Personnel Directory"
        description="Unified management of CA, CS, legal associates and operational staff credentials, departments, and live task throughput."
        bottomMeta={`${users.length} Registered Specialists • ${users.filter(u => u.status === "Active").length} Active Seats • Zero Open Breaches`}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll Specialist</span>
          </button>
        }
      />

      {/* 2. Team Productivity & Performer Podium Infographic & 4 Stat Cards */}
      <TeamInfographic users={users} tasks={tasks} />

      {/* 3. Minimal, Classy Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search specialist by name, email, phone, or service skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns + Status Pill Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          
          {/* Department Select */}
          <div className="w-full sm:w-44">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Role Select */}
          <div className="w-full sm:w-40">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status Quick Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(["ALL", "Active", "Deactivated"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {(search || selectedDept !== "ALL" || selectedRole !== "ALL" || selectedStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedDept("ALL");
                setSelectedRole("ALL");
                setSelectedStatus("ALL");
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* 4. Elegant, Minimal & Classy Personnel Table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Specialists &amp; Credentials
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-500/20">
              {filteredUsers.length} Active Profiles
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Live SLA Sync
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-5">Specialist Profile</th>
                <th className="py-3.5 px-4">Credentials &amp; Login</th>
                <th className="py-3.5 px-4">Department &amp; Role</th>
                <th className="py-3.5 px-4">Certified Competencies</th>
                <th className="py-3.5 px-3 text-center">Caseload</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No specialists match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userEmailDisplay = user.email || `${user.name.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`;
                  const isPasswordRevealed = showPasswordMap[user.id] || false;
                  const userPassword = user.password || "Password@123";
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name + Initials Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200/80 dark:border-slate-600 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              ID: #{String(user.id).padStart(4, "0")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Clean Credentials (Email + Concealed Password with Eye toggle) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <button
                            onClick={() => copyToClipboard(userEmailDisplay, user.id + "-email")}
                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-sky-400 font-semibold hover:underline text-[11px] group/copy"
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{userEmailDisplay}</span>
                            {copiedId === user.id + "-email" ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 opacity-0 group-hover/copy:opacity-100 text-slate-400 transition-opacity" />
                            )}
                          </button>

                          {/* Concealed Password chip */}
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            <span className="tracking-wider">
                              {isPasswordRevealed ? userPassword : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleUserPasswordReveal(user.id)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 cursor-pointer ml-1"
                              title={isPasswordRevealed ? "Hide password" : "Reveal password"}
                            >
                              {isPasswordRevealed ? (
                                <EyeOff className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {user.role}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {user.dept}
                          </span>
                        </div>
                      </td>

                      {/* Certified Service Competencies (Badges) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {(user.skills && user.skills.length > 0 ? user.skills : user.skill.split(", ")).map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-md font-bold text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Active Tasks Caseload */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                          {user.tasks}
                        </span>
                      </td>

                      {/* Phone with copy */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <button
                          onClick={() => copyToClipboard(user.phone, user.id + "-phone")}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-sky-400 cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            user.status === "Active"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditUserModal(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Edit Credentials & Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(user.id, user.name, user.status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              user.status === "Active"
                                ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900"
                            }`}
                          >
                            {user.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Add User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative space-y-4 animate-in zoom-in-95">
            <ModalHeaderBanner
              icon={UserPlus}
              badge="STAFF ONBOARDING"
              title="Enroll New Specialist"
              description="Add a verified internal operations or compliance specialist to the core roster."
              badgeTag="Personnel"
              onClose={() => setIsAddModalOpen(false)}
            />

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Jha"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Chartered Accountant"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Accounting">Accounting</option>
                    <option value="Legal">Legal</option>
                    <option value="Corporate Compliance">Corporate Compliance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Default Password
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Service Competencies
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  {availableSkillsList.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer"
                >
                  Enroll Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative space-y-4 animate-in zoom-in-95">
            <ModalHeaderBanner
              icon={Edit2}
              badge="STAFF CREDENTIALS"
              title={`Edit Specialist · ${formName}`}
              description="Update legal identity, access permissions, department role, or phone contact."
              badgeTag="Access Sync"
              onClose={() => setIsEditModalOpen(false)}
            />

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Accounting">Accounting</option>
                    <option value="Legal">Legal</option>
                    <option value="Corporate Compliance">Corporate Compliance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Login Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    System Password
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Service Competencies
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  {availableSkillsList.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
