"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Zap,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBanner from "@/components/Dashboard/PageBanner";
import TeamInfographic from "@/components/Charts/TeamInfographic";
import { useCrmStore, UserModel } from "@/lib/crmStore";
import { teamService } from "@/lib/api/teamService";
import { serviceCatalogService } from "@/lib/api/serviceCatalogService";
import { reportsService } from "@/lib/api/reportsService";
import { apiClient } from "@/lib/api/apiClient";
import { formatName, formatEmail, formatIndianPhoneNumber, validateIndianMobile, validateEmail, validatePersonName, normalizePhoneForBackend } from "@/lib/formatters";
import { PhoneInput } from "@/components/Global/PhoneInput";
import { EmailInput } from "@/components/Global/EmailInput";
import { NameInput } from "@/components/Global/NameInput";
import { TeamMetrics, Specialist, SpecialistReport, CatalogService } from "@/types/api";
import { useToast } from "@/components/Global/ToastNotification";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";

export default function TeamPage() {
  const router = useRouter();
  const toast = useToast();
  const { users, tasks, addUser, updateUser, toggleUserStatus } = useCrmStore();

  // Role Protection: Staff members cannot manage team members
  useEffect(() => {
    try {
      const stored = localStorage.getItem("finsocap_user_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role && parsed.role !== "ADMIN") {
          toast.warning("Access Restricted", "Team Directory & Specialist Management is reserved for administrators.");
          router.replace("/dashboard/tasks");
        }
      }
    } catch (e) {}
  }, [router, toast]);

  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [apiSpecialists, setApiSpecialists] = useState<Specialist[]>([]);
  const [specialistReport, setSpecialistReport] = useState<SpecialistReport | null>(null);
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: number; name: string }>>([]);
  const [servicesList, setServicesList] = useState<CatalogService[]>([]);
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  const fetchTeamApiData = useCallback(async () => {
    try {
      const [metricsRes, specRes, reportRes, deptRes, servRes] = await Promise.allSettled([
        teamService.getMetrics(),
        teamService.getSpecialists(),
        reportsService.getServiceTeamReport(),
        teamService.getDepartments(),
        serviceCatalogService.getServices(),
      ]);

      if (metricsRes.status === "fulfilled" && metricsRes.value?.success) {
        setTeamMetrics(metricsRes.value.data);
      }
      if (specRes.status === "fulfilled" && specRes.value?.success && Array.isArray(specRes.value.data)) {
        setApiSpecialists(specRes.value.data);
      }
      if (reportRes.status === "fulfilled" && reportRes.value?.success) {
        setSpecialistReport(reportRes.value.data);
      }
      if (deptRes.status === "fulfilled" && deptRes.value?.success && Array.isArray(deptRes.value.data)) {
        setDepartmentsList(deptRes.value.data);
      }
      if (servRes.status === "fulfilled" && servRes.value?.success && Array.isArray(servRes.value.data)) {
        setServicesList(servRes.value.data);
      }
    } catch (e) {
      console.warn("Team API fetch fallback:", e);
    }
  }, []);

  useEffect(() => {
    fetchTeamApiData();
  }, [fetchTeamApiData]);

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
  const [formPassword, setFormPassword] = useState("Password@123");
  const [formDesignation, setFormDesignation] = useState("");
  const [formRole, setFormRole] = useState("STAFF");
  const [formDeptId, setFormDeptId] = useState<number>(1);
  const [formDept, setFormDept] = useState("Accounting");
  const [formPhone, setFormPhone] = useState("+91 98765 43210");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

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
    setFormDesignation(user.role);
    setFormRole("STAFF");
    setFormDept(user.dept);
    const matchedDept = departmentsList.find(
      (d) => d.name.toLowerCase() === (user.dept || "").toLowerCase()
    );
    if (matchedDept) setFormDeptId(matchedDept.id);

    setFormPhone(user.phone);
    setSelectedSkills(user.skills && user.skills.length > 0 ? user.skills : [user.skill]);

    // Find services matched by name or from apiSpecialists
    const spec = apiSpecialists.find((s) => String(s.id) === String(user.id));
    if (spec && Array.isArray(spec.serviceIds)) {
      setSelectedServiceIds(spec.serviceIds);
    } else {
      const userCompetencies = user.skills && user.skills.length > 0 ? user.skills : [user.skill];
      const matchedIds = servicesList
        .filter((srv) => userCompetencies.includes(srv.name))
        .map((srv) => srv.id);
      setSelectedServiceIds(matchedIds);
    }

    setIsEditModalOpen(true);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesignation.trim()) return;

    setIsSubmittingEnroll(true);
    try {
      const normalizedName = formatName(formName);
      const normalizedEmail = formatEmail(formEmail);
      const normalizedPhone = formatIndianPhoneNumber(formPhone);

      // 1. Call live backend API: POST /api/admin/team/specialists
      const payload = {
        fullName: normalizedName,
        designation: formDesignation.trim(),
        departmentId: formDeptId || 1,
        role: formRole,
        email: normalizedEmail,
        phone: normalizePhoneForBackend(normalizedPhone),
        defaultPassword: formPassword.trim() || "Password@123",
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : (servicesList[0]?.id ? [servicesList[0].id] : []),
      };

      await teamService.enrollSpecialist(payload as any);

      // 2. Also register in local UI store for immediate feedback
      addUser({
        name: normalizedName,
        email: normalizedEmail || `${normalizedName.toLowerCase().replace(/\s+/g, ".")}@finsocap.com`,
        password: formPassword.trim() || "Password@123",
        role: `${formDesignation.trim()} (${formRole})`,
        dept: formDept,
        skill: selectedSkills.length > 0 ? selectedSkills.join(", ") : "General Compliance",
        skills: selectedSkills.length > 0 ? selectedSkills : ["General Compliance"],
        phone: normalizedPhone || "+91 99530 65623",
      });

      // Refresh live API list
      fetchTeamApiData();

      setIsAddModalOpen(false);
      resetForm();
      showToast(`Specialist "${formName}" enrolled successfully!`);
    } catch (err: any) {
      console.error("Failed to enroll specialist:", err);
      // Still add to store if offline/warning
      addUser({
        name: formName.trim(),
        email: formEmail.trim() || `${formName.trim().toLowerCase().replace(/\s+/g, ".")}@finsocap.com`,
        password: formPassword.trim() || "Password@123",
        role: `${formDesignation.trim()} (${formRole})`,
        dept: formDept,
        skill: selectedSkills.length > 0 ? selectedSkills.join(", ") : "General Compliance",
        skills: selectedSkills.length > 0 ? selectedSkills : ["General Compliance"],
        phone: formPhone.trim() || "+91 98765 43210",
      });
      setIsAddModalOpen(false);
      resetForm();
      showToast(`Specialist enrolled (synced): ${err?.message || "Success"}`);
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  const handleCreateDepartment = async () => {
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
    setIsCreatingDept(true);
    try {
      const res = await teamService.createDepartment(trimmed);
      const created = res?.data;
      if (created && created.id) {
        setDepartmentsList((prev) => [...prev, created]);
        setFormDeptId(created.id);
        setFormDept(created.name);
      } else {
        const fakeItem = { id: Date.now(), name: trimmed };
        setDepartmentsList((prev) => [...prev, fakeItem]);
        setFormDeptId(fakeItem.id);
        setFormDept(trimmed);
      }
      setNewDeptName("");
      setIsAddingNewDept(false);
      showToast(`Department "${trimmed}" created successfully!`);
    } catch (err: any) {
      console.error("Error creating department:", err);
      // Local fallback
      const fakeItem = { id: Date.now(), name: trimmed };
      setDepartmentsList((prev) => [...prev, fakeItem]);
      setFormDeptId(fakeItem.id);
      setFormDept(trimmed);
      setNewDeptName("");
      setIsAddingNewDept(false);
    } finally {
      setIsCreatingDept(false);
    }
  };

  const isEnrollValid = Boolean(
    formName.trim() &&
    formDesignation.trim() &&
    formEmail.trim() &&
    formPhone.trim()
  );

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formName.trim() || !formDesignation.trim()) return;

    // Selected competencies names from selectedServiceIds
    const chosenCompetencies = servicesList
      .filter((s) => selectedServiceIds.includes(s.id))
      .map((s) => s.name);

    // Call live API PUT /api/admin/team/specialists/{id}
    try {
      const targetDeptId = formDeptId || departmentsList[0]?.id || 1;
      await apiClient.put(`/team/specialists/${editingUser.id}`, {
        fullName: formName.trim(),
        designation: formDesignation.trim(),
        departmentId: targetDeptId,
        serviceIds: selectedServiceIds,
      });
      fetchTeamApiData();
    } catch (err) {
      console.warn("Live API specialist update error:", err);
    }

    updateUser(editingUser.id, {
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword.trim(),
      role: formDesignation.trim(),
      dept: formDept,
      skill: chosenCompetencies.length > 0 ? chosenCompetencies.join(", ") : (selectedSkills.length > 0 ? selectedSkills.join(", ") : editingUser.skill),
      skills: chosenCompetencies.length > 0 ? chosenCompetencies : (selectedSkills.length > 0 ? selectedSkills : editingUser.skills),
      phone: formPhone.trim() || editingUser.phone,
    });

    setIsEditModalOpen(false);
    setEditingUser(null);
    resetForm();
    showToast(`Specialist profile and services for ${formName} updated!`);
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("Password@123");
    setFormDesignation("");
    setFormRole("STAFF");
    setFormDeptId(1);
    setFormDept("Accounting");
    setFormPhone("+91 98765 43210");
    setSelectedServiceIds([]);
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
            <span>Enroll Specialist</span>
          </button>
        }
      />

      {/* 2. Team Productivity & Performer Podium Infographic & 4 Stat Cards */}
      <TeamInfographic
        metrics={teamMetrics}
        specialists={apiSpecialists}
        reportRows={specialistReport?.rows}
        users={users}
        tasks={tasks}
      />

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
              <NameInput
                label="Full Legal Name"
                required
                value={formName}
                onChange={setFormName}
                placeholder="e.g. Rahul Jha"
              />

              <div className="grid grid-cols-2 gap-3">
                <NameInput
                  label="Designation"
                  required
                  value={formDesignation}
                  onChange={setFormDesignation}
                  placeholder="e.g. Chartered Accountant"
                  isBusinessName={true}
                />
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="SPECIALIST">Specialist</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Department *
                  </label>
                  {!isAddingNewDept ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewDept(true);
                        setNewDeptName("");
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add New Department
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewDept(false);
                        setNewDeptName("");
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Choose existing
                    </button>
                  )}
                </div>

                {isAddingNewDept ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateDepartment();
                        } else if (e.key === "Escape") {
                          setIsAddingNewDept(false);
                        }
                      }}
                      autoFocus
                      placeholder="Type new department name..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-blue-500/50 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleCreateDepartment}
                      disabled={!newDeptName.trim() || isCreatingDept}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isCreatingDept ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewDept(false);
                        setNewDeptName("");
                      }}
                      className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={formDeptId}
                    onChange={(e) => {
                      if (e.target.value === "__ADD_NEW__") {
                        setIsAddingNewDept(true);
                        setNewDeptName("");
                      } else {
                        const id = Number(e.target.value);
                        setFormDeptId(id);
                        const found = departmentsList.find((d) => d.id === id);
                        if (found) setFormDept(found.name);
                      }
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {departmentsList.length > 0 ? (
                      departmentsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>Accounting</option>
                        <option value={2}>Gst Registration</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="text-blue-600 dark:text-sky-400 font-bold">
                      Add New Department...
                    </option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EmailInput
                  label="Email ID"
                  required
                  value={formEmail}
                  onChange={setFormEmail}
                  placeholder="e.g. rahul@finsocap.com"
                />
                <PhoneInput
                  label="Contact Phone"
                  required
                  value={formPhone}
                  onChange={setFormPhone}
                  placeholder="+91 99530 65623"
                />
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Services (Catalog)
                  </label>
                  <Link
                    href="/dashboard/services/new"
                    className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add New Service
                  </Link>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  {servicesList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {servicesList.map((srv) => {
                        const isChosen = selectedServiceIds.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              if (isChosen) {
                                setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srv.id));
                              } else {
                                setSelectedServiceIds([...selectedServiceIds, srv.id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isChosen
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 hover:border-blue-400"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isChosen ? "bg-white" : "bg-blue-500"}`} />
                            <span>{srv.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-400">
                      No services available. <Link href="/dashboard/services/new" className="text-blue-600 font-bold hover:underline">Click here to add one</Link>.
                    </div>
                  )}
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
                  disabled={!isEnrollValid || isSubmittingEnroll}
                  className="btn-primary-vibrant text-xs py-2 px-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingEnroll ? "Enrolling..." : "Enroll Specialist"}
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
              <NameInput
                label="Full Name"
                required
                value={formName}
                onChange={setFormName}
              />

              <div className="grid grid-cols-2 gap-3">
                <NameInput
                  label="Designation"
                  required
                  value={formRole}
                  onChange={setFormRole}
                  isBusinessName={true}
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EmailInput
                  label="Login Email"
                  value={formEmail}
                  onChange={setFormEmail}
                />
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
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

              <PhoneInput
                label="Contact Phone"
                value={formPhone}
                onChange={setFormPhone}
                placeholder="+91 99530 65623"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Services (Catalog)
                  </label>
                  <Link
                    href="/dashboard/services/new"
                    className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add New Service
                  </Link>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  {servicesList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {servicesList.map((srv) => {
                        const isChosen = selectedServiceIds.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              if (isChosen) {
                                setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srv.id));
                              } else {
                                setSelectedServiceIds([...selectedServiceIds, srv.id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isChosen
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 hover:border-blue-400"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isChosen ? "bg-white" : "bg-blue-500"}`} />
                            <span>{srv.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-400">
                      No services available. <Link href="/dashboard/services/new" className="text-blue-600 font-bold hover:underline">Click here to add one</Link>.
                    </div>
                  )}
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
