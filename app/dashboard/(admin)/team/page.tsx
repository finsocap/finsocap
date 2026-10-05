"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, UserPlus, Search, Phone, Mail, CheckCircle2, 
  Clock, X, RotateCcw, Award, Briefcase, Filter, Eye, EyeOff, Plus, Check,
  Edit2, KeyRound, Lock, Trash2
} from "lucide-react";
import { useCrmStore, UserModel } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import TeamInfographic from "@/components/Charts/TeamInfographic";
import PageBanner from "@/components/Dashboard/PageBanner";

const departments = ["Operations", "Taxation", "Compliance", "Legal", "Franchise Partner"];
const roles = ["Executive", "CA", "CS", "Legal Executive", "Admin"];

export default function TeamPage() {
  const { services, users, tasks, addUser, updateUser, deleteUser, toggleUserStatus } = useCrmStore();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Exact Services created in Products/Services are dynamically mapped as skills
  const availableServices = useMemo(() => {
    return services.map((s) => s.name);
  }, [services]);

  // Add User modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form fields for Add User
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["FSSAI Registration (Basic)"]);
  const [formSkill, setFormSkill] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formAccess, setFormAccess] = useState<"Employee" | "Admin" | "Manager">("Employee");
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false);

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Per-user password reveal state map: clicking reveals ONLY that specific row's password
  const [showPasswordMap, setShowPasswordMap] = useState<Record<number, boolean>>({});

  const toggleUserPasswordReveal = (userId: number) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // KPIs
  const activeUsersCount = users.filter((u) => u.status === "Active").length;
  const deactivatedUsersCount = users.filter((u) => u.status !== "Active").length;
  const seatsUsed = `${users.length} / 12`;
  const openAssignmentsCount = tasks.filter((t) => t.assignee).length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedDept !== "ALL" && u.dept !== selectedDept) return false;
      if (selectedRole !== "ALL" && u.role !== selectedRole) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.skill.toLowerCase().includes(q) ||
          u.dept.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, search, selectedDept, selectedRole]);

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || selectedSkills.length === 0) {
      showToast("Please enter name, phone number, and select at least one service skill.");
      return;
    }

    const generatedEmail = formEmail.trim() || `${formName.trim().toLowerCase().replace(/\s+/g, ".")}@finsocap.com`;

    addUser({
      name: formName.trim(),
      email: generatedEmail,
      role: formRole.trim() || "Executive",
      dept: formDept || "Operations",
      skill: selectedSkills.join(", "),
      skills: selectedSkills,
      phone: formPhone.trim(),
      password: formPassword.trim() || "Password@123",
      access: formAccess,
    });

    setFormName("");
    setFormEmail("");
    setFormRole("");
    setFormDept("");
    setSelectedSkills(["Food & Beverage"]);
    setFormSkill("");
    setFormPhone("");
    setFormPassword("");
    setFormAccess("Employee");
    setIsAddModalOpen(false);
    showToast(`User "${formName}" added successfully.`);
  };

  const openEditUserModal = (u: UserModel) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email || `${u.name.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`);
    setEditRole(u.role);
    setEditDept(u.dept);
    setEditPhone(u.phone);
    setEditPassword(u.password || "Password@123");
    setEditSkills(u.skills && u.skills.length > 0 ? u.skills : u.skill.split(", "));
    setShowEditPassword(false);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editPhone.trim()) {
      showToast("Name and phone are required.");
      return;
    }

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole.trim() || editingUser.role,
      dept: editDept || editingUser.dept,
      phone: editPhone.trim(),
      password: editPassword.trim() || editingUser.password,
      skills: editSkills,
      skill: editSkills.join(", "),
    });

    setEditingUser(null);
    showToast(`User "${editName}" updated successfully.`);
  };

  const toggleEditSkill = (skill: string) => {
    if (editSkills.includes(skill)) {
      if (editSkills.length > 1) {
        setEditSkills(editSkills.filter((s) => s !== skill));
      } else {
        showToast("At least one service skill is required.");
      }
    } else {
      setEditSkills([...editSkills, skill]);
    }
  };

  const handleToggle = (id: number, name: string, currentStatus: string) => {
    toggleUserStatus(id);
    showToast(`${name} is now ${currentStatus === "Active" ? "deactivated" : "reactivated"}.`);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
      } else {
        showToast("At least one service skill is required.");
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. Executive Branded Command Banner (Signature Finsocap Glassmorphic Gradient) */}
      <PageBanner
        icon={ShieldCheck}
        badge="Finsocap Workforce Cloud"
        badgeMeta="Role-Based Access & Identity Management"
        title="Team & Personnel Directory"
        description="Manage employee credentials, departmental access, CA/CS qualifications and productivity metrics."
        bottomMeta={`${users.length} Total Registered Personnel • ${users.filter(u => u.status === "Active").length} Active Seats`}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary-vibrant text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add User</span>
          </button>
        }
      />

      {/* Team Productivity & Performer Podium Infographic */}
      <TeamInfographic users={users} tasks={tasks} />

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
            ♙
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Users</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={activeUsersCount} />
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
            ⊘
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deactivated Users</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={deactivatedUsersCount} />
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
            ▣
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Seats Used</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              {seatsUsed}
            </p>
          </div>
        </div>

        <div className="card-luxury p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg shrink-0">
            ☑
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Assignments</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={openAssignmentsCount} />
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="p-3.5 bg-white dark:bg-[#0c1427] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-48">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {(search || selectedDept !== "ALL" || selectedRole !== "ALL") && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedDept("ALL");
              setSelectedRole("ALL");
            }}
            className="btn-gold-vibrant text-xs py-2 px-3.5 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 4. Team Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email ID</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Department</th>
                <th className="py-3.5 px-3">Service Skills</th>
                <th className="py-3.5 px-2 text-center">Tasks</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No team members found with these criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userEmailDisplay = user.email || `${user.name.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`;
                  const isPasswordRevealed = showPasswordMap[user.id] || false;
                  const userPassword = user.password || "Password@123";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block whitespace-nowrap">
                          {user.name}
                        </span>
                      </td>

                      {/* Email ID */}
                      <td className="py-3.5 px-4">
                        <a
                          href={`mailto:${userEmailDisplay}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-sky-400 font-semibold hover:underline text-[11px]"
                        >
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{userEmailDisplay}</span>
                        </a>
                      </td>

                      {/* Password (Click to toggle single password) */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-wider">
                            {isPasswordRevealed ? userPassword : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleUserPasswordReveal(user.id)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 p-0.5 cursor-pointer transition-colors"
                            title={isPasswordRevealed ? "Hide Password" : "Click to view password"}
                          >
                            {isPasswordRevealed ? (
                              <EyeOff className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-300 whitespace-nowrap">
                          {user.role}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {user.dept}
                      </td>

                      {/* Service Skills */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(user.skills && user.skills.length > 0 ? user.skills : user.skill.split(", ")).map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Tasks */}
                      <td className="py-3.5 px-2 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {user.tasks}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {user.phone}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                          {user.status}
                        </span>
                      </td>

                      {/* Actions: Edit + Deactivate */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditUserModal(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer"
                            title="Edit User Details, Email & Password"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
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
                            {user.status === "Active" ? "Deactivate" : "Reactivate"}
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

      {/* Modal: Add User (Screenshot 2 Exact Match) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Add User
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 mt-5">
              {/* Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. employee@finsocap.com (or auto-generated)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Designation * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="Enter designation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Department * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Service Skill * (Multi-Service Skill Category Add Buttons) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Service Skills *
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-sky-400 font-semibold">
                    {selectedSkills.length} service skills assigned
                  </span>
                </div>

                {/* Selected Skills Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[38px] mb-2 max-h-28 overflow-y-auto">
                  {selectedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Buttons for Service Catalog Services */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400">
                    + Click exact service to assign/remove from employee skills:
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                    {availableServices.map((srv) => {
                      const isSelected = selectedSkills.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleSkill(srv)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {isSelected ? `✓ ${srv}` : `+ ${srv}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Phone Number * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Password * (Screenshot 2: 'panel mai password nahi available hai banane ke liye') */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Save Button (Full-width Screenshot 2 Exact Match) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#5252f6] hover:bg-[#4343e0] text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 cursor-pointer transition-all active:scale-[0.99]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User (Full Details, Email ID, Password & Service Skills) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Edit User: {editingUser.name}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Update profile credentials, role permissions, and service specializations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 mt-5">
              {/* Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Email ID * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email ID *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                    title={showEditPassword ? "Hide Password" : "Show Password"}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Designation * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="e.g. Executive, CA, CS"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Department * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Number * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Service Skills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assigned Service Skills
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold">
                    {editSkills.length} service skills assigned
                  </span>
                </div>

                {/* Selected Skills Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[38px] mb-2 max-h-28 overflow-y-auto">
                  {editSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => toggleEditSkill(sk)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Services quick add buttons matching Screenshot 1 exactly */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400">
                    Click to add/remove service skills:
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                    {availableServices.map((srv) => {
                      const isSelected = editSkills.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleEditSkill(srv)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {isSelected ? `✓ ${srv}` : `+ ${srv}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-[0.99]"
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
