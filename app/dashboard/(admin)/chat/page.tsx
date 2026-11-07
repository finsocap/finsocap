"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Send, Search, CheckCheck, Users, Plus, X,
  Sparkles, MessageSquare, Loader2, Smile,
  Paperclip, MoreVertical, Check, User,
  FileText, Pin, Download, ExternalLink,
  Mail, Phone, MapPin, RefreshCw, UserCheck,
  ChevronDown, Trash2
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { messageService } from "@/lib/api/messageService";
import { teamService } from "@/lib/api/teamService";
import { partnerService } from "@/lib/api/partnerService";
import { clientCrmService } from "@/lib/api/clientCrmService";
import { ConversationItem, ChatMessageItem, CreateConversationPayload } from "@/types/api";
import UniversalFilePreviewModal from "@/components/Dashboard/UniversalFilePreviewModal";
import { useCrmStore } from "@/lib/crmStore";

export default function ChatPage() {
  const { tasks } = useCrmStore();
  // Navigation Filter: All chats, Direct, Groups
  const [tab, setTab] = useState<"ALL" | "DIRECT" | "GROUP">("ALL");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);

  // Current logged in user context
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  useEffect(() => {
    try {
      const sess = localStorage.getItem("finsocap_user_session");
      if (sess) {
        const p = JSON.parse(sess);
        const r = (p?.user?.role || p?.role || "ADMIN").toUpperCase().trim();
        setUserRole(r);
        setCurrentUser(p?.user || p);
      }
    } catch (e) { }
  }, []);

  // Track IDs of messages sent from this user in this session (persisted per conversation)
  const [sentMessageIds, setSentMessageIds] = useState<Set<number>>(new Set());

  // Track locally deleted / hidden conversation IDs
  const [deletedConvIds, setDeletedConvIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const myEmail = (currentUser?.email || "").toLowerCase().trim();
      const stored = localStorage.getItem(`finsocap_sent_msgs_${myEmail}`);
      if (stored) {
        setSentMessageIds(new Set(JSON.parse(stored)));
      }
      const storedDeleted = localStorage.getItem(`finsocap_deleted_convs_${myEmail}`);
      if (storedDeleted) {
        setDeletedConvIds(new Set(JSON.parse(storedDeleted)));
      }
    } catch (e) { }
  }, [currentUser?.email]);
  const [showContactDetails, setShowContactDetails] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Compose / Create Conversation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [targetType, setTargetType] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<"TEAM" | "PARTNER" | "CLIENT">("TEAM");
  const [directorySearch, setDirectorySearch] = useState("");

  // Directory records fetched from backend APIs
  const [teamList, setTeamList] = useState<any[]>([]);
  const [partnerList, setPartnerList] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

  // Group creation selections
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<any[]>([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [initialMessageText, setInitialMessageText] = useState("");

  // Emoji Picker & AI Assistant
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Universal File Preview State
  const [previewFile, setPreviewFile] = useState<{
    isOpen: boolean;
    fileName: string;
    fileUrl: string;
    uploadedBy?: string;
    uploadDate?: string;
  }>({
    isOpen: false,
    fileName: "",
    fileUrl: "",
  });

  const EMOJI_LIST = ["👍", "🙏", "❤️", "😊", "✨", "🔥", "🤝", "🎉", "💼", "✅", "🚀", "💰", "📈", "🏦", "🧾", "📑"];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Fetch Conversation list from API
  const fetchConversations = async (silent = false) => {
    if (!silent) setIsLoadingConversations(true);
    try {
      const res = await messageService.getConversations();
      if (res && res.data && Array.isArray(res.data)) {
        setConversations(res.data);
        if (!activeConversation && res.data.length > 0) {
          setActiveConversation(res.data[0]);
        }
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      if (!silent) setIsLoadingConversations(false);
    }
  };

  // Fetch directory for modal
  const fetchDirectory = async () => {
    setIsLoadingDirectory(true);
    try {
      const [tRes, pRes, cRes] = await Promise.allSettled([
        teamService.getSpecialists(),
        partnerService.getPartners(),
        clientCrmService.getClients(),
      ]);

      if (tRes.status === "fulfilled" && tRes.value?.success && Array.isArray(tRes.value.data)) {
        setTeamList(tRes.value.data);
      }
      if (pRes.status === "fulfilled" && pRes.value?.success && Array.isArray(pRes.value.data)) {
        setPartnerList(pRes.value.data);
      }
      if (cRes.status === "fulfilled" && cRes.value?.success && Array.isArray(cRes.value.data)) {
        setClientList(cRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load contact directory:", err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  // Fetch chronological messages for active conversation
  const fetchActiveMessages = async (convId: number | string, silent = false) => {
    if (!silent) setIsLoadingMessages(true);
    try {
      const res = await messageService.getMessages(convId);
      if (res && res.data && Array.isArray(res.data)) {
        if (silent && res.data.length > prevMsgCountRef.current && prevMsgCountRef.current > 0) {
          const last = res.data[res.data.length - 1];
          if (!last.isFromAdmin) {
            soundEffects.playMessageReceived();
          }
        }
        prevMsgCountRef.current = res.data.length;
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // When active conversation changes, load its messages and mark as read
  useEffect(() => {
    if (activeConversation) {
      fetchActiveMessages(activeConversation.id);
      messageService.markAsRead(activeConversation.id).catch(() => { });
      setConversations(prev =>
        prev.map(c => (c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
      );
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // Periodic polling for live chat sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchConversations(true);
        if (activeConversation) {
          fetchActiveMessages(activeConversation.id, true);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConversation?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeConversation || isSending) return;

    setIsSending(true);
    try {
      const text = newMessage.trim();
      const fileToSend = selectedFile || undefined;

      // Encode authenticated sender into message payload so backend records exact sender identity
      const myDisplayName = (currentUser?.name || (userRole === "ADMIN" ? "Operations Admin" : "User")).trim();
      const encodedPayload = `[[sender:${myDisplayName}|role:${userRole}]] ${text}`.trim();

      const res = await messageService.sendMessage(activeConversation.id, encodedPayload, fileToSend);
      if (res && res.data) {
        soundEffects.playMessageSent();
        setNewMessage("");
        setSelectedFile(null);

        // Track this message as sent by the current user locally
        if (res.data.id) {
          const newId = Number(res.data.id);
          const myEmail = (currentUser?.email || "").toLowerCase().trim();
          setSentMessageIds(prev => {
            const updated = new Set(prev).add(newId);
            try {
              localStorage.setItem(`finsocap_sent_msgs_${myEmail}`, JSON.stringify(Array.from(updated)));
            } catch (e) { }
            return updated;
          });
        }

        setMessages(prev => [...prev, res.data]);
        setConversations(prev =>
          prev.map(c =>
            c.id === activeConversation.id
              ? { ...c, lastMessage: text || "Sent an attachment" }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      alert(err?.message || "Failed to deliver message. Please retry.");
    } finally {
      setIsSending(false);
    }
  };

  // Quick Direct Chat Starter (WhatsApp style: 1-click on user from directory)
  const handleStartDirectChat = async (contact: any, role: "SPECIALIST" | "PARTNER" | "CLIENT" | "ADMIN" | string) => {
    setCreating(true);
    setCreateError("");
    try {
      const name = contact.fullName || contact.name || "Contact";
      const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

      // 1. Check if a direct conversation between current user and this contact already exists
      const myDisplayName = (currentUser?.name || (isAdmin ? "Universal Admin" : "User")).trim();
      const myEmail = (currentUser?.email || "").toLowerCase().trim();
      const targetName = name.trim();
      const targetEmail = (contact.email || "").toLowerCase().trim();

      const existing = conversations.find(c => {
        if (c.type === "GROUP") return false;
        // Don't match conversations that the user explicitly deleted / hid
        if (deletedConvIds.has(c.id)) return false;

        const pName = (c.participantName || "").toLowerCase().trim();
        const pEmail = (c.participantEmail || "").toLowerCase().trim();
        const title = (c.title || "").toLowerCase().trim();
        const targetLower = targetName.toLowerCase();
        const myLower = myDisplayName.toLowerCase();

        // Exact match on compound title "UserA & UserB"
        if (title.includes("&")) {
          const hasTarget = title.includes(targetLower) || (targetEmail && title.includes(targetEmail));
          const hasMe = title.includes(myLower) || (myEmail && title.includes(myEmail)) || (isAdmin && title.includes("admin"));
          if (hasTarget && hasMe) return true;
        }

        // Direct participant matching
        if (isAdmin) {
          return pName === targetLower || (pEmail && targetEmail && pEmail === targetEmail) || title === targetLower;
        }

        // For non-admin (e.g. Test Role Specialist):
        // Only match if this thread specifically belongs to ME and TARGET
        const isWithTarget = pName === targetLower || (pEmail && targetEmail && pEmail === targetEmail);
        const isWithMe = title.includes(myLower) || (myEmail && title.includes(myEmail));
        return isWithTarget && isWithMe;
      });

      if (existing) {
        setShowCreateModal(false);
        setActiveConversation(existing);
        setCreating(false);
        return;
      }

      // If user had previously hidden this contact's conversation, unhide it!
      const previouslyDeleted = conversations.find(c => {
        if (c.type === "GROUP") return false;
        const pName = (c.participantName || "").toLowerCase().trim();
        const title = (c.title || "").toLowerCase().trim();
        const targetLower = targetName.toLowerCase();
        return pName === targetLower || title.includes(targetLower);
      });

      if (previouslyDeleted && deletedConvIds.has(previouslyDeleted.id)) {
        const updated = new Set(deletedConvIds);
        updated.delete(previouslyDeleted.id);
        setDeletedConvIds(updated);
        try {
          localStorage.setItem(`finsocap_deleted_convs_${myEmail}`, JSON.stringify(Array.from(updated)));
        } catch (e) { }
        setShowCreateModal(false);
        setActiveConversation(previouslyDeleted);
        setCreating(false);
        return;
      }

      // 2. Compound Title ensures privacy: "Test Role Specialist & Rahul Jha"
      // Backend stores title, allowing strict 1-to-1 isolation so OTHER team members cannot see this thread!
      const compoundTitle = isAdmin
        ? targetName
        : `${myDisplayName} & ${targetName}`;

      const payload: CreateConversationPayload = {
        title: compoundTitle,
        type: "DIRECT",
        participantName: targetName,
        participantRole: role,
        participantPhone: contact.phone || contact.mobileNumber || "",
        participantEmail: contact.email || "",
        participantLocation: contact.city || contact.department || "India",
        initialMessage: `[[sender:${myDisplayName}|role:${userRole}]] Conversation started`,
      };

      const res = await messageService.createConversation(payload);
      if (res && res.data) {
        setShowCreateModal(false);
        setConversations(prev => [res.data, ...prev.filter(c => c.id !== res.data.id)]);
        setActiveConversation(res.data);
        await fetchConversations(true);
      }
    } catch (err: any) {
      setCreateError(err?.message || "Failed to start conversation.");
    } finally {
      setCreating(false);
    }
  };

  // Group Creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) {
      setCreateError("Please provide a group name or subject.");
      return;
    }
    if (selectedGroupMembers.length === 0) {
      setCreateError("Please select at least 1 team member or partner for the group.");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      const memberNames = selectedGroupMembers.map(m => m.name).join(", ");
      const payload: CreateConversationPayload = {
        title: groupTitle.trim(),
        type: "GROUP",
        participantName: `${selectedGroupMembers.length} Members (${memberNames.slice(0, 30)}...)`,
        participantRole: "SPECIALIST",
        participantPhone: selectedGroupMembers[0]?.phone || "",
        participantEmail: "",
        participantLocation: "Finsocap Workspace",
        initialMessage: initialMessageText.trim() || `Group created with ${selectedGroupMembers.length} participants.`,
      };

      const res = await messageService.createConversation(payload);
      if (res && res.data) {
        setShowCreateModal(false);
        setGroupTitle("");
        setSelectedGroupMembers([]);
        setInitialMessageText("");
        await fetchConversations();
        setActiveConversation(res.data);
      }
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  // AI Quick Suggest
  const handleAiSuggestReply = (promptText: string) => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setNewMessage(promptText);
      setIsAiGenerating(false);
    }, 400);
  };

  // Filter conversations based on role, tab and search
  const filteredConversations = useMemo(() => {
    const roleUpper = userRole.toUpperCase().trim();
    const isAdmin = roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN";
    const isOpRole = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(roleUpper);
    const isPartner = roleUpper === "PARTNER";
    const isClient = roleUpper === "CLIENT";

    const myName = (currentUser?.name || "").toLowerCase().trim();
    const myEmail = (currentUser?.email || "").toLowerCase().trim();

    // Assigned partner & client names from CRM tasks for operational staff
    const assignedPartners = new Set<string>();
    const assignedClients = new Set<string>();
    const assignedStaffForPartnerOrClient = new Set<string>();

    tasks.forEach(t => {
      const a = (t.assignee || "").toLowerCase().trim();
      const p = (t.partner || "").toLowerCase().trim();
      const c = (t.client || "").toLowerCase().trim();

      if (isOpRole) {
        const matchesMe = (myName && (a.includes(myName) || myName.includes(a))) || (myEmail && a.includes(myEmail));
        if (matchesMe) {
          if (p) assignedPartners.add(p);
          if (c) assignedClients.add(c);
        }
      } else if (isPartner) {
        const matchesPartner = (myName && (p.includes(myName) || myName.includes(p))) || (myEmail && p.includes(myEmail));
        if (matchesPartner && a) {
          assignedStaffForPartnerOrClient.add(a);
        }
      } else if (isClient) {
        const matchesClient = (myName && (c.includes(myName) || myName.includes(c))) || (myEmail && c.includes(myEmail));
        if (matchesClient && a) {
          assignedStaffForPartnerOrClient.add(a);
        }
      }
    });

    return conversations.filter(c => {
      // Filter out user-deleted / hidden conversations
      if (deletedConvIds.has(c.id)) return false;

      const pName = (c.participantName || "").toLowerCase().trim();
      const pEmail = (c.participantEmail || "").toLowerCase().trim();
      const title = (c.title || "").toLowerCase().trim();
      const partRole = (c.participantRole || "").toUpperCase().trim();

      // STRICT WHATSAPP RULE:
      // Peer 1-on-1 private chat between two specific users (e.g. "Test Role Specialist & Rahul Jha")
      // Only and ONLY the two individuals involved can see or participate in this conversation!
      // No other employee or admin can intercept, read, or send into their direct private chat.
      if (title.includes("&")) {
        const hasMe = (myName && title.includes(myName)) || (myEmail && title.includes(myEmail));
        if (!hasMe) return false;
      }

      // 1. Admin can access organizational threads (support threads, client/partner tickets, public groups)
      if (isAdmin) {
        const matchesTab =
          tab === "ALL" ? true : tab === "GROUP" ? c.type === "GROUP" : c.type !== "GROUP";
        const matchesSearch =
          searchQuery.trim() === "" ||
          c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      }

      // 2. Non-Admin (STAFF, PARTNER, CLIENT) Confidential Scoping
      if (c.type === "GROUP") {
        // Group chat: only visible if user is a member/participant
        const inGroup = (myName && (pName.includes(myName) || title.includes(myName))) ||
          (myEmail && (pEmail.includes(myEmail) || title.includes(myEmail)));
        if (!inGroup) return false;
      } else {
        // Direct 1-to-1 Chat:
        // Rule 1: A compound peer chat (e.g. "UserA & UserB") is ONLY visible to the two people involved!
        if (title.includes("&")) {
          const hasMe = (myName && title.includes(myName)) || (myEmail && title.includes(myEmail));
          return Boolean(hasMe);
        }

        // Rule 2: Dedicated direct chat between Admin and this staff member (e.g. "Test Role Specialist" or "Operations Admin")
        const isMyDirectThread = pName === myName || (myEmail && pEmail === myEmail) || title === myName;
        const isAdminThread = partRole === "ADMIN" || pName.includes("admin") || (title.includes("admin") && !title.includes("onboarding"));
        if (isMyDirectThread || isAdminThread) return true;

        // Rule 3: Assigned Partner handling (for Staff)
        if (isOpRole && partRole === "PARTNER") {
          const matchesPartner = (pName && assignedPartners.has(pName)) || Array.from(assignedPartners).some(ap => ap && title.includes(ap));
          return Boolean(matchesPartner);
        }

        // Rule 4: Assigned Client handling (for Staff)
        if (isOpRole && partRole === "CLIENT") {
          const matchesClient = (pName && assignedClients.has(pName)) || Array.from(assignedClients).some(ac => ac && title.includes(ac));
          return Boolean(matchesClient);
        }

        // Rule 5: Assigned Staff handling (for Partner or Client)
        if ((isPartner || isClient) && (partRole === "SPECIALIST" || partRole === "STAFF")) {
          const matchesStaff = (pName && assignedStaffForPartnerOrClient.has(pName)) || Array.from(assignedStaffForPartnerOrClient).some(as => as && title.includes(as));
          return Boolean(matchesStaff);
        }

        // Rule 6: Client referred by this partner
        if (isPartner && partRole === "CLIENT") {
          return Boolean(myName && title.includes(myName));
        }

        return false;
      }

      const matchesTab =
        tab === "ALL" ? true : tab === "GROUP" ? c.type === "GROUP" : c.type !== "GROUP";
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [conversations, tab, searchQuery, userRole, currentUser, tasks, deletedConvIds]);

  // Auto-select first scoped conversation when filtered list updates
  useEffect(() => {
    if (filteredConversations.length > 0) {
      if (!activeConversation || !filteredConversations.some(c => c.id === activeConversation.id)) {
        setActiveConversation(filteredConversations[0]);
      }
    } else {
      setActiveConversation(null);
    }
  }, [filteredConversations]);

  // Filter directory for modal based on search, tab and strict role assignment rules
  const filteredDirectory = useMemo(() => {
    const roleUpper = userRole.toUpperCase().trim();
    const isAdmin = roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN";
    const isOpRole = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(roleUpper);
    const isPartner = roleUpper === "PARTNER";
    const isClient = roleUpper === "CLIENT";

    const myName = (currentUser?.name || "").toLowerCase().trim();
    const myEmail = (currentUser?.email || "").toLowerCase().trim();

    // Assigned partners, clients, and staff based on role tasks
    const assignedPartnerNames = new Set<string>();
    const assignedClientNames = new Set<string>();
    const assignedStaffNames = new Set<string>();

    tasks.forEach(t => {
      const a = (t.assignee || "").toLowerCase().trim();
      const p = (t.partner || "").toLowerCase().trim();
      const c = (t.client || "").toLowerCase().trim();

      if (isOpRole) {
        const matchesMe = (myName && (a.includes(myName) || myName.includes(a))) || (myEmail && a.includes(myEmail));
        if (matchesMe) {
          if (p) assignedPartnerNames.add(p);
          if (c) assignedClientNames.add(c);
        }
      } else if (isPartner) {
        const matchesPartner = (myName && (p.includes(myName) || myName.includes(p))) || (myEmail && p.includes(myEmail));
        if (matchesPartner && a) assignedStaffNames.add(a);
      } else if (isClient) {
        const matchesClient = (myName && (c.includes(myName) || myName.includes(c))) || (myEmail && c.includes(myEmail));
        if (matchesClient && a) assignedStaffNames.add(a);
      }
    });

    const q = directorySearch.toLowerCase().trim();
    if (selectedDirectoryCategory === "TEAM") {
      const items: any[] = [];

      // 1. Always include Operations Admin for non-admin users (Staff, Partner, Client)
      if (!isAdmin) {
        items.push({
          id: "team-admin-1",
          rawId: 0,
          name: "Operations Admin",
          sub: "Central Administration • Management",
          phone: "+91 99530 65623",
          email: "admin@gmail.com",
          role: "ADMIN" as const,
          avatarBg: "bg-indigo-600",
        });
      }

      teamList
        .filter(t => {
          const tName = (t.fullName || "").toLowerCase().trim();
          // Hide yourself
          if (myName && (tName === myName || tName.includes(myName))) return false;
          // Partner/Client can only direct chat with their assigned staff
          if ((isPartner || isClient) && !assignedStaffNames.has(tName)) return false;
          return !q || t.fullName?.toLowerCase().includes(q) || t.designation?.toLowerCase().includes(q) || t.phone?.includes(q);
        })
        .forEach(t => {
          items.push({
            id: `team-${t.id}`,
            rawId: t.id,
            name: t.fullName,
            sub: `${t.designation} • ${t.department || "Operations"}`,
            phone: t.phone,
            email: t.email,
            role: "SPECIALIST" as const,
            avatarBg: "bg-blue-600",
          });
        });

      return items;
    }
    if (selectedDirectoryCategory === "PARTNER") {
      // Clients cannot chat directly with arbitrary partners
      if (isClient) return [];
      return partnerList
        .filter(p => {
          const pName = (p.name || "").toLowerCase().trim();
          // Hide yourself if you are partner
          if (isPartner && myName && (pName === myName || pName.includes(myName))) return false;
          // Operational staff can only chat with assigned partners
          if (isOpRole && !assignedPartnerNames.has(pName)) return false;
          return !q || p.name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.city?.toLowerCase().includes(q);
        })
        .map(p => ({
          id: `partner-${p.id}`,
          rawId: p.id,
          name: p.name,
          sub: `Partner (${p.partnerId || `P-${p.id}`}) • ${p.city || p.state || "Active"}`,
          phone: p.phone,
          email: p.email,
          role: "PARTNER" as const,
          avatarBg: "bg-emerald-600",
        }));
    }
    if (selectedDirectoryCategory === "CLIENT") {
      // Clients cannot browse other clients
      if (isClient) return [];
      return clientList
        .filter(c => {
          const cName = (c.name || "").toLowerCase().trim();
          // Non-admin operational staff can only chat with assigned clients
          if (isOpRole && !assignedClientNames.has(cName)) return false;
          // Partners can only chat with their own referred clients
          if (isPartner && myName && !(c.partnerName || "").toLowerCase().includes(myName)) return false;
          return !q || c.name?.toLowerCase().includes(q) || c.businessName?.toLowerCase().includes(q) || c.phone?.includes(q);
        })
        .map(c => ({
          id: `client-${c.id}`,
          rawId: c.id,
          name: c.name,
          sub: `${c.businessName || "Applicant"} • By ${c.partnerName || "HQ"}`,
          phone: c.phone,
          email: c.email,
          role: "CLIENT" as const,
          avatarBg: "bg-purple-600",
        }));
    }
    return [];
  }, [selectedDirectoryCategory, teamList, partnerList, clientList, directorySearch, userRole, currentUser, tasks]);

  // Scoped directory counts for pill badges
  const directoryCounts = useMemo(() => {
    const roleUpper = userRole.toUpperCase().trim();
    const isAdmin = roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN";
    const isOpRole = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(roleUpper);
    const isPartner = roleUpper === "PARTNER";
    const isClient = roleUpper === "CLIENT";

    const myName = (currentUser?.name || "").toLowerCase().trim();
    const myEmail = (currentUser?.email || "").toLowerCase().trim();

    const assignedPartnerNames = new Set<string>();
    const assignedClientNames = new Set<string>();
    const assignedStaffNames = new Set<string>();

    tasks.forEach(t => {
      const a = (t.assignee || "").toLowerCase().trim();
      const p = (t.partner || "").toLowerCase().trim();
      const c = (t.client || "").toLowerCase().trim();

      if (isOpRole) {
        const matchesMe = (myName && (a.includes(myName) || myName.includes(a))) || (myEmail && a.includes(myEmail));
        if (matchesMe) {
          if (p) assignedPartnerNames.add(p);
          if (c) assignedClientNames.add(c);
        }
      } else if (isPartner) {
        const matchesPartner = (myName && (p.includes(myName) || myName.includes(p))) || (myEmail && p.includes(myEmail));
        if (matchesPartner && a) assignedStaffNames.add(a);
      } else if (isClient) {
        const matchesClient = (myName && (c.includes(myName) || myName.includes(c))) || (myEmail && c.includes(myEmail));
        if (matchesClient && a) assignedStaffNames.add(a);
      }
    });

    if (isAdmin) {
      return {
        teamCount: teamList.length,
        partnerCount: partnerList.length,
        clientCount: clientList.length,
      };
    }

    if (isOpRole) {
      return {
        teamCount: teamList.filter(t => !myName || !t.fullName?.toLowerCase().trim().includes(myName)).length + 1,
        partnerCount: partnerList.filter(p => assignedPartnerNames.has((p.name || "").toLowerCase().trim())).length,
        clientCount: clientList.filter(c => assignedClientNames.has((c.name || "").toLowerCase().trim())).length,
      };
    }

    if (isPartner) {
      return {
        teamCount: assignedStaffNames.size + 1, // Admin + assigned specialists
        partnerCount: 0, // Partners do not chat with unrelated partners
        clientCount: clientList.filter(c => myName && (c.partnerName || "").toLowerCase().includes(myName)).length,
      };
    }

    if (isClient) {
      return {
        teamCount: assignedStaffNames.size + 1, // Admin + assigned specialist
        partnerCount: 0,
        clientCount: 0,
      };
    }

    return { teamCount: teamList.length, partnerCount: partnerList.length, clientCount: clientList.length };
  }, [teamList, partnerList, clientList, userRole, currentUser, tasks]);

  // Extract shared files from messages for right panel
  const sharedFiles = messages.filter(m => m.attachmentUrl);

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[620px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden relative font-sans">

      {/* =========================================================================
          PANEL 1 (LEFT): WhatsApp-style Sidebar (Search, Filter Tabs, Conversation List)
         ========================================================================= */}
      <aside className={`w-full md:w-[320px] lg:w-[360px] xl:w-[380px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>

        {/* Top Header: Title & WhatsApp Style New Chat Icon */}
        <div className="p-4 pb-2 border-b border-slate-100/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Chats</h1>
              <p className="text-[11px] text-slate-400 font-medium">WhatsApp Live Sync</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchConversations()}
                title="Refresh Chats"
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingConversations ? "animate-spin text-blue-600" : ""}`} />
              </button>
              <button
                onClick={() => {
                  fetchDirectory();
                  setShowCreateModal(true);
                }}
                title="Start New Chat or Group (WhatsApp style)"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* WhatsApp-style Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search or start new chat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tab Filter: All chats | Direct | Groups */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab("ALL")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${tab === "ALL"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              All ({filteredConversations.length})
            </button>
            <button
              onClick={() => setTab("DIRECT")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${tab === "DIRECT"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Direct
            </button>
            <button
              onClick={() => setTab("GROUP")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${tab === "GROUP"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Conversation List Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60">
          {isLoadingConversations && conversations.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Syncing conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">No Conversations</h4>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                {searchQuery ? "No matching contacts found." : "Click '+' above to search staff or partners and start chatting."}
              </p>
              <button
                onClick={() => {
                  fetchDirectory();
                  setShowCreateModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = activeConversation?.id === conv.id;
              const initials = (conv.participantName || conv.title || "C")
                .split(" ")
                .map(p => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const roleLabel = conv.participantRole === "PARTNER"
                ? "Franchise Partner"
                : conv.participantRole === "SPECIALIST"
                  ? "Team Staff"
                  : conv.participantRole === "CLIENT"
                    ? "Client"
                    : "";

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${isActive
                    ? "bg-blue-50/70 border-l-blue-600"
                    : "hover:bg-slate-50/80 border-l-transparent"
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.type === "GROUP" ? (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-700 to-[#1b2b5a] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        {initials}
                      </div>
                    )}
                    {conv.type !== "GROUP" && (
                      <span
                        className={`w-3 h-3 rounded-full ring-2 ring-white absolute bottom-0 right-0 ${conv.isOnline ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        title={conv.isOnline ? "Online" : "Offline"}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`text-xs truncate ${isActive ? "text-blue-950 font-black" : "text-slate-800 font-bold"}`}>
                        {conv.participantName || conv.title}
                      </h3>
                      {roleLabel && (
                        <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1 shrink-0">
                          {roleLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-slate-500 truncate font-normal">
                        {(conv.lastMessage || "No messages yet").replace(/^\[\[sender:[^\]]+\]\]\s*/i, "")}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* =========================================================================
          PANEL 2 (CENTER): Active Conversation Messages & Chat Composer
         ========================================================================= */}
      <main className={`flex-1 flex flex-col bg-slate-50/40 relative ${!activeConversation ? "hidden md:flex items-center justify-center" : "flex"}`}>
        {!activeConversation ? (
          <div className="text-center p-8 text-slate-400 max-w-sm">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Select a Conversation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Choose a message thread from the left sidebar to read history, send attachments, or engage with team members.
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <header className="h-[70px] bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative">
                  {activeConversation.type === "GROUP" ? (
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1b2b5a] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {((activeConversation.participantName || activeConversation.title || "U") ?? "U").charAt(0)}
                    </div>
                  )}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ring-2 ring-white absolute bottom-0 right-0 ${activeConversation.isOnline ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-slate-900 truncate">
                    {activeConversation.participantName || (activeConversation.title && !activeConversation.title.includes("&") ? activeConversation.title : "Conversation")}
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeConversation.participantRole ? `${activeConversation.participantRole} • ` : ""}
                    {activeConversation.isOnline ? (
                      <span className="text-emerald-600 font-semibold">Active now</span>
                    ) : (
                      <span className="text-slate-400 font-medium">Offline</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (!activeConversation) return;
                    if (confirm(`Delete conversation with ${activeConversation.participantName || activeConversation.title || "this contact"}?`)) {
                      const idToDelete = activeConversation.id;
                      const myEmail = (currentUser?.email || "").toLowerCase().trim();
                      const updated = new Set(deletedConvIds).add(idToDelete);
                      setDeletedConvIds(updated);
                      try {
                        localStorage.setItem(`finsocap_deleted_convs_${myEmail}`, JSON.stringify(Array.from(updated)));
                      } catch (e) { }
                      setActiveConversation(null);
                    }
                  }}
                  title="Delete Conversation"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchActiveMessages(activeConversation.id)}
                  title="Refresh Thread"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? "animate-spin text-blue-600" : ""}`} />
                </button>
                <button
                  onClick={() => setShowContactDetails(!showContactDetails)}
                  title="Toggle Contact Details"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${showContactDetails ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Messages Viewport */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
                  <div className="px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-xs">
                    Start conversation with {activeConversation.participantName || activeConversation.title || "contact"}...
                  </div>
                </div>
              ) : (
                (() => {
                  let lastDateHeader = "";

                  return messages.map((msg, idx) => {
                    // WhatsApp Date Grouping Logic
                    let showDateHeader = false;
                    let dateLabel = "";
                    if (msg.timestamp) {
                      const msgDate = new Date(msg.timestamp);
                      const now = new Date();
                      const isToday = msgDate.toDateString() === now.toDateString();
                      const yesterday = new Date();
                      yesterday.setDate(now.getDate() - 1);
                      const isYesterday = msgDate.toDateString() === yesterday.toDateString();

                      if (isToday) dateLabel = "Today";
                      else if (isYesterday) dateLabel = "Yesterday";
                      else dateLabel = msgDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

                      if (dateLabel !== lastDateHeader) {
                        showDateHeader = true;
                        lastDateHeader = dateLabel;
                      }
                    }

                    // Strict WhatsApp User Isolation & Sender Detection:
                    // Extract custom encoded sender info if present: [[sender:Name|role:ROLE]]
                    let rawText = msg.messageText || "";
                    let parsedSenderName = msg.senderName;
                    let parsedSenderRole = msg.senderRole;
                    const tagMatch = rawText.match(/^\[\[sender:([^|\]]+)(?:\|role:([^\]]+))?\]\]\s*/i);
                    if (tagMatch) {
                      parsedSenderName = tagMatch[1].trim();
                      if (tagMatch[2]) parsedSenderRole = tagMatch[2].trim().toUpperCase();
                      rawText = rawText.replace(tagMatch[0], "");
                    }

                    // Determine whether this bubble was sent by the active authenticated user
                    const myName = (currentUser?.name || "").toLowerCase().trim();
                    const otherParticipantName = (activeConversation.participantName || "").toLowerCase().trim();
                    const isGroupChat = activeConversation.type === "GROUP";
                    const isOpRole = ["STAFF", "SPECIALIST", "EXECUTIVE"].includes(userRole);
                    const isPartner = userRole === "PARTNER";
                    const isClient = userRole === "CLIENT";

                    const isTrackedSent = msg.id ? sentMessageIds.has(Number(msg.id)) : false;

                    let isMine = false;
                    if (isTrackedSent) {
                      isMine = true;
                    } else if (tagMatch && parsedSenderName) {
                      // Explicit encoded sender match
                      const sName = parsedSenderName.toLowerCase();
                      if (myName && (sName === myName || sName.includes(myName) || myName.includes(sName))) {
                        isMine = true;
                      } else if (userRole === "ADMIN" && (parsedSenderRole === "ADMIN" || sName.includes("admin"))) {
                        isMine = true;
                      }
                    } else if (rawText === "Conversation started") {
                      // Initial system prompt is incoming/neutral
                      isMine = false;
                    } else if (userRole === "ADMIN") {
                      // For Universal Admin in a 1-to-1 conversation with a Staff/Partner/Client:
                      // If the conversation is directly with a target user (e.g. Rahul Jha or Sandeep Maurya),
                      // check if message is from the other participant.
                      if (!isGroupChat && otherParticipantName) {
                        const sName = (parsedSenderName || "").toLowerCase().trim();
                        const isFromOther = sName.includes(otherParticipantName) || otherParticipantName.includes(sName);
                        isMine = !isFromOther;
                      } else {
                        isMine = msg.isFromAdmin;
                      }
                    } else if (!isGroupChat && otherParticipantName) {
                      // In a 1-to-1 chat for non-admin (e.g. Test Role Specialist chatting with Sandeep Maurya):
                      // Messages from the other participant are INCOMING (isMine = false).
                      // Any message sent by this user (or not from other participant) is OUTGOING (isMine = true).
                      const sName = (parsedSenderName || "").toLowerCase().trim();
                      const isFromOtherParticipant = sName.includes(otherParticipantName) || otherParticipantName.includes(sName);

                      if (myName && sName.includes(myName)) {
                        isMine = true;
                      } else if (!isFromOtherParticipant) {
                        isMine = true;
                      }
                    } else {
                      // Fallback for group chat
                      if (myName && (parsedSenderName || "").toLowerCase().trim().includes(myName)) {
                        isMine = true;
                      } else if (!msg.isFromAdmin && (parsedSenderRole || "").toUpperCase() === userRole) {
                        isMine = true;
                      }
                    }

                    const timeFormatted = msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";

                    return (
                      <div key={msg.id || idx} className="space-y-3">
                        {/* WhatsApp Centered Date Divider */}
                        {showDateHeader && (
                          <div className="flex items-center justify-center my-3">
                            <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[11px] font-bold shadow-2xs uppercase tracking-wide">
                              {dateLabel}
                            </span>
                          </div>
                        )}

                        <div className={`group flex items-end gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase mb-1">
                              {parsedSenderName?.charAt(0) || "U"}
                            </div>
                          )}

                          <div className={`relative max-w-[72%] sm:max-w-[62%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                            {/* WhatsApp rule: Show sender tag ONLY if group chat and not my message */}
                            {!isMine && isGroupChat && (
                              <span className="text-[10px] font-bold text-blue-600 mb-1 ml-2">
                                {parsedSenderName} ({parsedSenderRole || "PARTICIPANT"})
                              </span>
                            )}

                            <div
                              className={`px-4 py-3 text-[13px] leading-relaxed transition-all shadow-xs ${isMine
                                ? "bg-blue-600 text-white rounded-3xl rounded-br-xs font-normal"
                                : "bg-white text-slate-800 rounded-3xl rounded-bl-xs border border-slate-100"
                                }`}
                            >
                              <div className="break-words whitespace-pre-wrap">{rawText}</div>

                              {/* Attachment View / Preview */}
                              {msg.attachmentUrl && (
                                <div className="mt-2.5 pt-2 border-t border-white/20">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rawUrl = msg.attachmentUrl || "";
                                      const cleanFileName = rawUrl.split("/").pop() || `Attachment_${msg.id}.pdf`;
                                      setPreviewFile({
                                        isOpen: true,
                                        fileName: cleanFileName,
                                        fileUrl: rawUrl,
                                        uploadedBy: parsedSenderName || "Specialist",
                                        uploadDate: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString("en-GB") : "Today",
                                      });
                                    }}
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${isMine
                                      ? "bg-white/20 hover:bg-white/30 text-white"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                                      }`}
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>View Attachment</span>
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Timestamp & Status Tick */}
                            <div className="flex items-center gap-1.5 mt-1 mx-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">
                                {timeFormatted}
                              </span>
                              {isMine && (
                                <span className="inline-flex items-center text-blue-600 font-bold" title="Delivered">
                                  <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 relative">
              {/* Selected file preview pill */}
              {selectedFile && (
                <div className="mb-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-0.5 hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-6 mb-3 w-[280px] bg-white rounded-2xl p-3 border border-slate-200 shadow-xl z-30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Quick Reactions</span>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-1.5 text-lg">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach File / Document"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Insert Reaction"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:text-amber-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || isSending}
                  className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* =========================================================================
          PANEL 3 (RIGHT): Thread & Participant Details
         ========================================================================= */}
      {showContactDetails && activeConversation && (
        <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-100 p-5 flex flex-col justify-between hidden xl:flex">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 tracking-tight">Thread Details</h4>
              <button
                onClick={() => setShowContactDetails(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-700 to-[#1b2b5a] text-white mx-auto flex items-center justify-center text-xl font-bold uppercase shadow-sm">
                {((activeConversation.participantName || activeConversation.title || "U") ?? "U").charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {activeConversation.participantName || activeConversation.title}
                </h4>
                <div className="inline-block mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {activeConversation.participantRole || "Participant"}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Topic */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Conversation Subject
              </div>
              <div className="font-semibold text-slate-800">
                {activeConversation.title && !activeConversation.title.includes("&")
                  ? activeConversation.title
                  : `Direct Chat with ${activeConversation.participantName || "Team Member"}`}
              </div>
            </div>

            {/* Contact Details (Rendered only when provided by API) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              {activeConversation.participantPhone && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-800">
                    {activeConversation.participantPhone}
                  </span>
                </div>
              )}

              {activeConversation.participantEmail && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-800 truncate">
                    {activeConversation.participantEmail}
                  </span>
                </div>
              )}

              {activeConversation.participantLocation && (
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-800">
                    {activeConversation.participantLocation}
                  </span>
                </div>
              )}
            </div>

            {/* Shared Attachments */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-900">Shared Files</h5>
                <span className="text-[10px] font-bold text-slate-400">
                  {sharedFiles.length} file{sharedFiles.length === 1 ? "" : "s"}
                </span>
              </div>

              {sharedFiles.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                  No attachments in this thread yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {sharedFiles.map(fileMsg => {
                    const rawUrl = fileMsg.attachmentUrl || "";
                    const cleanFileName = rawUrl.split("/").pop() || `Attachment_${fileMsg.id}.pdf`;
                    return (
                      <button
                        key={fileMsg.id}
                        type="button"
                        onClick={() => {
                          setPreviewFile({
                            isOpen: true,
                            fileName: cleanFileName,
                            fileUrl: rawUrl,
                            uploadedBy: fileMsg.senderName || "Specialist",
                            uploadDate: fileMsg.timestamp ? new Date(fileMsg.timestamp).toLocaleDateString("en-GB") : "Today",
                          });
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center gap-2.5 transition-colors text-xs text-slate-800 group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">Attachment #{fileMsg.id}</div>
                          <div className="text-[10px] text-slate-400 truncate">Click to view/download</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* =========================================================================
          WHATSAPP-STYLE NEW CHAT / GROUP MODAL
         ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">

            <ModalHeaderBanner
              icon={MessageSquare}
              badge="WHATSAPP SYNC DIRECTORY"
              title="Start New Chat or Group"
              description="Pick a contact from your team or partner directory, or create a group thread."
              badgeTag="Live Directory"
              onClose={() => setShowCreateModal(false)}
            />

            <div className="p-5 flex-1 flex flex-col space-y-3.5 overflow-hidden">
              {createError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {createError}
                </div>
              )}

              {/* Toggle Direct vs Group */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("DIRECT");
                    setCreateError("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${targetType === "DIRECT"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Direct 1-on-1 Chat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("GROUP");
                    setCreateError("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${targetType === "GROUP"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Create Team / Case Group
                </button>
              </div>

              {/* Mode A: Direct 1-on-1 Contact Search (WhatsApp style contact picker) */}
              {targetType === "DIRECT" ? (
                <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                  {/* Category Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDirectoryCategory("TEAM")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDirectoryCategory === "TEAM"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      Team Staff ({directoryCounts.teamCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDirectoryCategory("PARTNER")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDirectoryCategory === "PARTNER"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      Franchise Partners ({directoryCounts.partnerCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDirectoryCategory("CLIENT")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDirectoryCategory === "CLIENT"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      Clients ({directoryCounts.clientCount})
                    </button>
                  </div>

                  {/* Search Contact Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={`Search ${selectedDirectoryCategory.toLowerCase()} by name or phone...`}
                      value={directorySearch}
                      onChange={e => setDirectorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
                    />
                  </div>

                  {/* Contact List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-60 pr-1">
                    {isLoadingDirectory ? (
                      <div className="py-8 flex items-center justify-center text-slate-400 text-xs gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading verified contacts...</span>
                      </div>
                    ) : filteredDirectory.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No contacts found matching search query.
                      </div>
                    ) : (
                      filteredDirectory.map(contact => (
                        <div
                          key={contact.id}
                          onClick={() => handleStartDirectChat(contact, contact.role)}
                          className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className={`w-9 h-9 rounded-full ${contact.avatarBg} text-white flex items-center justify-center font-bold text-xs uppercase shrink-0`}>
                              {contact.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                                {contact.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate">
                                {contact.sub}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={creating}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Mode B: Group Creation Form */
                <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs flex-1 flex flex-col overflow-hidden">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Group Subject / Name *</label>
                    <input
                      type="text"
                      required
                      value={groupTitle}
                      onChange={e => setGroupTitle(e.target.value)}
                      placeholder="e.g. FSSAI Compliance Team, Rahul Enterprises Case Group"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">
                        Select Participants * ({selectedGroupMembers.length} selected)
                      </label>
                      <span className="text-[10px] text-slate-400">Click to add/remove</span>
                    </div>

                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-1 max-h-48">
                      {teamList.concat(partnerList).map((m: any) => {
                        const mId = m.id || m.userId;
                        const name = m.fullName || m.name;
                        const isSelected = selectedGroupMembers.some(x => x.id === mId);

                        return (
                          <div
                            key={mId}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedGroupMembers(prev => prev.filter(x => x.id !== mId));
                              } else {
                                setSelectedGroupMembers(prev => [...prev, { id: mId, name, phone: m.phone }]);
                              }
                            }}
                            className={`p-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-blue-50 text-blue-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                              }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {name.charAt(0)}
                              </span>
                              <span className="truncate">{name}</span>
                              <span className="text-[10px] text-slate-400">
                                ({m.designation || "Partner"})
                              </span>
                            </div>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                              }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Initial Group Message (Optional)</label>
                    <input
                      type="text"
                      value={initialMessageText}
                      onChange={e => setInitialMessageText(e.target.value)}
                      placeholder="Welcome team! Discussing case filings here..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !groupTitle.trim() || selectedGroupMembers.length === 0}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Create Group &rarr;</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Universal File Preview Modal for Chat Attachments */}
      <UniversalFilePreviewModal
        isOpen={previewFile.isOpen}
        onClose={() => setPreviewFile({ isOpen: false, fileName: "", fileUrl: "" })}
        title="Chat Attachment Preview"
        fileName={previewFile.fileName}
        fileUrl={previewFile.fileUrl}
        uploadedBy={previewFile.uploadedBy}
        uploadDate={previewFile.uploadDate}
        category="INTERNAL COMMUNICATION"
      />
    </div>
  );
}
