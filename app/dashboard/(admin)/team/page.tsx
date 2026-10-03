"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, UserPlus, Search, Phone, Mail, CheckCircle2, 
  Clock, X, RotateCcw, Award, Briefcase, Filter, Eye, EyeOff, Plus, Check
} from "lucide-react";
import { useCrmStore, UserModel } from "@/lib/crmStore";
import AnimatedCounter from "@/components/Global/AnimatedCounter";
import TeamInfographic from "@/components/Charts/TeamInfographic";
import PageBanner from "@/components/Dashboard/PageBanner";

const departments = ["Operations", "Taxation", "Compliance", "Legal", "Franchise Partner"];
const roles = ["Executive", "CA", "CS", "Legal Executive", "Admin"];
const serviceCategories = [
  "Food & Beverage",
  "Taxation",
  "Intellectual Property",
  "Business Compliance",
  "Import Export",
  "Digital Services",
  "Business Growth",
  "Compliance",
  "Licensing"
];

export default function TeamPage() {
  const { users, tasks, addUser, toggleUserStatus } = useCrmStore();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Add User modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form fields matching Screenshot 2
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Food & Beverage"]);
  const [formSkill, setFormSkill] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formAccess, setFormAccess] = useState<"Employee" | "Admin" | "Manager">("Employee");
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false);

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

    addUser({
      name: formName.trim(),
      role: formRole.trim() || "Executive",
      dept: formDept || "Operations",
      skill: selectedSkills.join(", "),
      skills: selectedSkills,
      phone: formPhone.trim(),
      password: formPassword.trim() || "Password@123",
      access: formAccess,
    });

    setFormName("");
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
                <th className="py-3.5 px-5">Name</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Service Skills</th>
                <th className="py-3.5 px-5 text-center">Tasks</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No team members found with these criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700 dark:text-slate-300">
                      {user.dept}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
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
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {user.tasks}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400">
                      {user.phone}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleToggle(user.id, user.name, user.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          user.status === "Active"
                            ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900"
                            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900"
                        }`}
                      >
                        {user.status === "Active" ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))
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
                    Service Skill *
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-sky-400 font-semibold">
                    {selectedSkills.length} category skills assigned
                  </span>
                </div>

                {/* Selected Skills Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[38px] mb-2">
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

                {/* Quick Add Buttons for Service Catalog Categories */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400">
                    + Click category to add/remove as per employee knowledge:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {serviceCategories.map((cat) => {
                      const isSelected = selectedSkills.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleSkill(cat)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {isSelected ? `✓ ${cat}` : `+ ${cat}`}
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
    </div>
  );
}
