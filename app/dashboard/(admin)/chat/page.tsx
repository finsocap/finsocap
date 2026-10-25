"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  Send, Search, CheckCheck, Check, Users, Plus, X, UserMinus, UserPlus, 
  Trash2, Sparkles, Bot, Wand2, MessageSquare, Loader2, Lightbulb, Smile, 
  Paperclip, SendHorizonal, Phone, Video, MoreVertical, MoreHorizontal,
  FileText, FileSpreadsheet, FileCode, Pin, ChevronRight, ArrowLeft,
  Mail, MapPin, ShieldCheck, Download, ExternalLink, Info, CheckCircle2
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import AccessDenied from "@/components/Dashboard/AccessDenied";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";

type ChatUser = { 
  id: string; 
  name: string; 
  role: string; 
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  about?: string;
  image?: string | null; 
  lastSeen?: string; 
  isOnline?: boolean;
};

type Group = { 
  id: string; 
  name: string; 
  createdBy: string; 
  members: { user: ChatUser }[];
};

type Message = { 
  id: string; 
  senderId: string; 
  receiverId?: string; 
  groupId?: string; 
  message: string; 
  createdAt: string; 
  sender?: { id: string; name: string; image?: string | null; role?: string }; 
  isDeleted?: boolean; 
  deletedFor?: string; 
  isDelivered?: boolean; 
  isRead?: boolean;
  isVisitor?: boolean;
  isAi?: boolean;
};

export default function ChatPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const canViewVisitors = userRole === "ADMIN" || userRole === "MANAGER";

  // Navigation Filter: All chats, Groups, Support (Website visitors)
  const [tab, setTab] = useState<"ALL" | "DIRECT" | "GROUP" | "VISITOR">("ALL");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [visitorChats, setVisitorChats] = useState<any[]>([]);
  
  // Active Chat State
  const [activeChat, setActiveChat] = useState<{ 
    type: "USER" | "GROUP" | "VISITOR"; 
    id: string; 
    name: string; 
    meta?: any 
  } | null>(null);

  // Right Contact Details Panel open/close
  const [showContactDetails, setShowContactDetails] = useState<boolean>(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);

  // Universal Delete Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    targetType: "CONVERSATION" | "MESSAGE";
    title: string;
    description: string;
    actionPayload: {
      messageId?: string;
      chatId?: string;
      deleteType?: "me" | "everyone" | "visitor_msg" | "visitor_chat" | "group_chat";
    };
  } | null>(null);

  // Finsocap AI Assistant for Live Chat
  const [isAiGeneratingChat, setIsAiGeneratingChat] = useState(false);
  const [aiGeneratingForMsgId, setAiGeneratingForMsgId] = useState<string | null>(null);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiLanguage, setAiLanguage] = useState<"english" | "hinglish">("english");

  // Emoji Picker & Quick Reaction State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<"frequent" | "finance" | "smileys" | "gestures">("frequent");

  const EMOJI_CATEGORIES = {
    frequent: ["👍", "🙏", "❤️", "😊", "✨", "🔥", "🤝", "🎉", "💼", "✅", "🚀", "💰"],
    finance: ["💰", "💳", "📈", "📉", "🏦", "💵", "💎", "📊", "🪙", "🧾", "📑", "🛡️"],
    smileys: ["😀", "😃", "😄", "😁", "😊", "😇", "🙂", "😉", "😍", "🤩", "😎", "🥳", "🤔", "💡", "👌", "🙌"],
    gestures: ["👍", "👎", "👏", "🙌", "🤝", "🙏", "✌️", "🤞", "👋", "✍️", "💪", "🎯"]
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevAdminMsgCountRef = useRef<number>(0);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/chat/users");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (e) {
      console.error("Failed to load chat users:", e);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/chat/groups");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setGroups(data);
      }
    } catch (e) {
      console.error("Failed to load groups:", e);
    }
  };

  const fetchVisitorChats = async () => {
    if (!canViewVisitors) return;
    try {
      const res = await fetch("/api/support/admin");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setVisitorChats(data);
      }
    } catch (e) {
      console.error("Failed to load visitor chats:", e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    if (canViewVisitors) {
      fetchVisitorChats();
    }

    const pingPresence = () => {
      fetch("/api/chat/presence", { method: "POST" }).catch(() => {});
    };
    pingPresence();

    const presenceInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        pingPresence();
        fetchUsers();
      }
    }, 15000);

    return () => clearInterval(presenceInterval);
  }, [canViewVisitors]);

  // Automatically select the first user or existing active chat
  useEffect(() => {
    if (!activeChat && users.length > 0) {
      const defaultUser = users[0];
      setActiveChat({
        type: "USER",
        id: defaultUser.id,
        name: defaultUser.name,
        meta: defaultUser
      });
    }
  }, [users, activeChat]);

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      if (activeChat.type === "VISITOR") {
        const res = await fetch(`/api/support/visitor?chatId=${activeChat.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.messages) {
            if (data.messages.length > prevAdminMsgCountRef.current && prevAdminMsgCountRef.current > 0) {
              const last = data.messages[data.messages.length - 1];
              if (last && last.senderType === "VISITOR") {
                soundEffects.playMessageReceived();
              }
            }
            prevAdminMsgCountRef.current = data.messages.length;

            const formatted = data.messages.map((m: any) => ({
              id: m.id,
              senderId: m.senderType === "ADMIN" ? currentUserId : m.senderType,
              message: m.message,
              createdAt: m.createdAt,
              sender: { id: m.senderType, name: m.senderName },
              isVisitor: m.senderType === "VISITOR",
              isAi: m.senderType === "AI"
            }));
            setMessages(formatted);
          }
        }
        return;
      }

      const endpoint = activeChat.type === "USER" 
        ? `/api/chat?userId=${activeChat.id}`
        : `/api/chat/groups/${activeChat.id}/messages`;
        
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          if (data.length > prevAdminMsgCountRef.current && prevAdminMsgCountRef.current > 0) {
            const last = data[data.length - 1];
            if (last && last.senderId !== currentUserId) {
              soundEffects.playMessageReceived();
            }
          }
          prevAdminMsgCountRef.current = data.length;
          const formatted = data.map((m: any) => ({
            ...m,
            message: m.message || m.text || "",
            createdAt: m.createdAt || m.timestamp || new Date().toISOString()
          }));
          setMessages(formatted);
        }
      }
    } catch (err) {
      console.error("Error fetching messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMessages();
        if (tab === "VISITOR" || tab === "ALL") fetchVisitorChats();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChat, tab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAiSuggestReply = async (customPrompt?: string, targetMessage?: { id?: string; text: string; senderName?: string }) => {
    if (!activeChat) return;
    setIsAiGeneratingChat(true);
    if (targetMessage?.id) {
      setAiGeneratingForMsgId(targetMessage.id);
    }

    try {
      let contextMsgText = "";
      if (targetMessage?.text) {
        contextMsgText = targetMessage.text;
      } else {
        const lastMsg = [...messages].reverse().find(m => m.senderId !== currentUserId);
        contextMsgText = lastMsg ? lastMsg.message : `Conversation with ${activeChat.name}`;
      }

      const senderName = targetMessage?.senderName || activeChat.name;

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          chatContext: contextMsgText,
          topic: customPrompt ? `Reply to "${contextMsgText}": ${customPrompt}` : `Replying to message from ${senderName}`,
          language: aiLanguage
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setNewMessage(data.text);
      }
    } catch (err) {
      console.error("AI Reply generation error:", err);
    } finally {
      setIsAiGeneratingChat(false);
      setAiGeneratingForMsgId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    setIsSending(true);
    try {
      if (activeChat.type === "VISITOR") {
        const res = await fetch("/api/support/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: activeChat.id, message: newMessage }),
        });
        if (res.ok) {
          soundEffects.playMessageSent();
          setNewMessage("");
          fetchMessages();
        }
        return;
      }

      const endpoint = activeChat.type === "USER" ? "/api/chat" : `/api/chat/groups/${activeChat.id}/messages`;
      const body = activeChat.type === "USER" 
        ? { receiverId: activeChat.id, message: newMessage }
        : { message: newMessage };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        soundEffects.playMessageSent();
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const res = await fetch("/api/chat/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName, memberIds: newGroupMembers }),
    });
    if (res.ok) {
      setShowCreateGroup(false);
      setNewGroupName("");
      setNewGroupMembers([]);
      fetchGroups();
    }
  };

  const addMemberToGroup = async (userId: string) => {
    if (!activeChat || activeChat.type !== "GROUP") return;
    await fetch(`/api/chat/groups/${activeChat.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    fetchGroups();
    const g = groups.find(g => g.id === activeChat.id);
    if (g) {
      const u = users.find(u => u.id === userId);
      if (u) setActiveChat({ ...activeChat, meta: { ...g, members: [...g.members, { user: u }] } });
    }
  };

  const removeMemberFromGroup = async (userId: string) => {
    if (!activeChat || activeChat.type !== "GROUP") return;
    await fetch(`/api/chat/groups/${activeChat.id}/members?userId=${userId}`, { method: "DELETE" });
    fetchGroups();
    const g = groups.find(g => g.id === activeChat.id);
    if (g) {
      setActiveChat({ ...activeChat, meta: { ...g, members: g.members.filter(m => m.user.id !== userId) } });
    }
  };

  const executeConfirmedDelete = async () => {
    if (!deleteConfirmation) return;
    const { actionPayload } = deleteConfirmation;

    if (actionPayload.messageId) {
      const msgId = actionPayload.messageId;
      const type = actionPayload.deleteType;

      if (activeChat?.type === "VISITOR") {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        try {
          await fetch(`/api/support/admin?messageId=${msgId}`, { method: "DELETE" });
          fetchMessages();
        } catch (e) {
          console.error("Delete visitor message error:", e);
        }
      } else {
        if (type === 'everyone') {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true } : m));
        } else {
          setMessages(prev => prev.filter(m => m.id !== msgId));
        }
        try {
          const endpoint = activeChat?.type === "USER" 
            ? `/api/chat?messageId=${msgId}&type=${type}` 
            : `/api/chat/groups/${activeChat?.id}/messages?messageId=${msgId}&type=${type}`;
          await fetch(endpoint, { method: "DELETE" });
          fetchMessages();
        } catch (err) {
          console.error("Delete error:", err);
          fetchMessages();
        }
      }
    } else if (actionPayload.chatId) {
      const targetChatId = actionPayload.chatId;

      if (actionPayload.deleteType === "visitor_chat") {
        setVisitorChats(prev => prev.filter(c => c.id !== targetChatId));
        if (activeChat?.id === targetChatId) {
          setActiveChat(null);
          setMessages([]);
        }
        try {
          await fetch(`/api/support/admin?chatId=${targetChatId}`, { method: "DELETE" });
          fetchVisitorChats();
        } catch (e) {
          console.error("Delete visitor chat error:", e);
        }
      } else if (actionPayload.deleteType === "me") {
        setMessages([]);
        try {
          for (const msg of messages) {
            await fetch(`/api/chat?messageId=${msg.id}&type=me`, { method: "DELETE" });
          }
          fetchMessages();
        } catch (e) {}
      }
    }

    setDeleteConfirmation(null);
  };

  const promptDeleteMessage = (msg: Message, type: 'me' | 'everyone' | 'visitor_msg') => {
    setDeleteMenuId(null);
    setDeleteConfirmation({
      isOpen: true,
      targetType: "MESSAGE",
      title: "Delete this message?",
      description: type === 'everyone' 
        ? "This message will be deleted for everyone in this chat." 
        : "This message will be removed from your chat history.",
      actionPayload: {
        messageId: msg.id,
        deleteType: type
      }
    });
  };

  const promptDeleteChat = (chatId: string, chatName: string, isVisitor: boolean = false) => {
    setDeleteConfirmation({
      isOpen: true,
      targetType: "CONVERSATION",
      title: isVisitor ? `Delete conversation with ${chatName}?` : `Clear conversation with ${chatName}?`,
      description: isVisitor 
        ? "All messages, visitor information, and inquiry history will be permanently deleted from the database." 
        : "All messages in this conversation will be cleared for your account.",
      actionPayload: {
        chatId,
        deleteType: isVisitor ? "visitor_chat" : "me"
      }
    });
  };

  const renderMessageText = (text: string | undefined | null, isMine: boolean) => {
    if (!text || typeof text !== "string") {
      return text || "";
    }
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <strong key={i} className={isMine ? "text-blue-100 font-bold bg-white/20 px-1.5 py-0.5 rounded" : "text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded"}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  // Active contact details helper
  const activeUserObj: ChatUser | undefined = users.find(u => u.id === activeChat?.id) || (activeChat?.meta as ChatUser);

  // Safe filtered arrays with Array.isArray fallbacks
  const safeUsers = Array.isArray(users) ? users : [];
  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeVisitors = Array.isArray(visitorChats) ? visitorChats : [];

  const filteredUsers = safeUsers.filter(u => u?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredGroups = safeGroups.filter(g => g?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVisitors = safeVisitors.filter(v => 
    v?.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (v?.email && v.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pinned users (first 3 users or priority team)
  const pinnedUsers = filteredUsers.slice(0, 3);
  const recentUsers = filteredUsers.slice(3);

  if (session && userRole === "WRITER") {
    return (
      <AccessDenied 
        title="Access Denied to Live Chat"
        description="You do not have permission to access Live Chat. This section is reserved for administrators and operations managers."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[620px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden relative font-sans">
      
      {/* =========================================================================
          PANEL 1 (LEFT): Messages List (Pinned, Recent, Tabs, Search)
         ========================================================================= */}
      <aside className={`w-full md:w-[320px] lg:w-[340px] xl:w-[360px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Top Header: Title & Compose Button */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Messages</h1>
            <button 
              onClick={() => {
                if (tab === "GROUP" || isAdmin) {
                  setShowCreateGroup(true);
                }
              }}
              title="Compose New Message / Group"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100/80 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none border border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Tab Filter: All chats | Groups | Support */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 rounded-xl text-xs font-semibold">
            <button 
              onClick={() => setTab("ALL")} 
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                tab === "ALL" 
                  ? "bg-white text-blue-600 shadow-xs font-bold" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All chats
            </button>
            <button 
              onClick={() => setTab("GROUP")} 
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                tab === "GROUP" 
                  ? "bg-white text-blue-600 shadow-xs font-bold" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Groups
            </button>
            {canViewVisitors && (
              <button 
                onClick={() => setTab("VISITOR")} 
                className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                  tab === "VISITOR" 
                    ? "bg-white text-blue-600 shadow-xs font-bold" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Support</span>
                {visitorChats.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {visitorChats.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-4">
          
          {/* TAB: ALL OR DIRECT */}
          {(tab === "ALL" || tab === "DIRECT") && (
            <>
              {/* PINNED SECTION */}
              {pinnedUsers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Pin className="w-3 h-3 rotate-45 text-slate-400" />
                    <span>Pinned</span>
                  </div>

                  <div className="space-y-1">
                    {pinnedUsers.map((user, idx) => {
                      const isActive = activeChat?.id === user.id;
                      const initials = user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
                      const unreadBadge = idx === 0 ? 2 : idx === 2 ? 3 : idx === 1 ? 1 : 0;
                      
                      return (
                        <div
                          key={user.id}
                          onClick={() => setActiveChat({ type: "USER", id: user.id, name: user.name, meta: user })}
                          className={`p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                            isActive 
                              ? 'bg-blue-50/70 border border-blue-100/80 shadow-xs' 
                              : 'hover:bg-slate-50/80 border border-transparent'
                          }`}
                        >
                          {/* Avatar with Online Green Dot */}
                          <div className="relative flex-shrink-0">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-xs"
                              />
                            ) : (
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                                idx === 2 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : idx === 1 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {initials || user.name.charAt(0)}
                              </div>
                            )}
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              user.isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`} />
                          </div>

                          {/* Name, Last message preview, Timestamp, Unread Badge */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className={`font-semibold text-xs truncate ${isActive ? 'text-blue-950 font-bold' : 'text-slate-800'}`}>
                                {user.name}
                              </h3>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {idx === 0 ? "10:32 AM" : idx === 1 ? "09:48 AM" : "09:21 AM"}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[11px] text-slate-500 truncate">
                                {idx === 0 
                                  ? "Sure, I'll share the document now." 
                                  : idx === 1 
                                  ? "Okay, I'll check with the team." 
                                  : "Call at 11 AM?"}
                              </p>
                              {unreadBadge > 0 && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                                  {unreadBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RECENT CHATS SECTION */}
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span>Recent Chats</span>
                </div>

                <div className="space-y-1">
                  {/* Team Finance Group item */}
                  {groups.length > 0 && (
                    <div
                      key={groups[0].id}
                      onClick={() => setActiveChat({ type: "GROUP", id: groups[0].id, name: groups[0].name, meta: groups[0] })}
                      className={`p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                        activeChat?.id === groups[0].id 
                          ? 'bg-blue-50/70 border border-blue-100/80 shadow-xs' 
                          : 'hover:bg-slate-50/80 border border-transparent'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 border border-blue-100/70">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-semibold text-xs text-slate-800 truncate">{groups[0].name}</h3>
                          <span className="text-[10px] text-slate-400 font-medium">Yesterday</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[11px] text-slate-500 truncate">Neha: Document received.</p>
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                            5
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other recent team members */}
                  {recentUsers.map((user, idx) => {
                    const isActive = activeChat?.id === user.id;
                    const initials = user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

                    return (
                      <div
                        key={user.id}
                        onClick={() => setActiveChat({ type: "USER", id: user.id, name: user.name, meta: user })}
                        className={`p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-blue-50/70 border border-blue-100/80 shadow-xs' 
                            : 'hover:bg-slate-50/80 border border-transparent'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-xs"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                              {initials || user.name.charAt(0)}
                            </div>
                          )}
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.isOnline ? "bg-emerald-500" : "bg-slate-300"
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className={`font-semibold text-xs truncate ${isActive ? 'text-blue-950 font-bold' : 'text-slate-800'}`}>
                              {user.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {idx === 0 ? "Yesterday" : idx === 1 ? "Fri" : "Thu"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {idx === 0 
                              ? "Thanks for the update!" 
                              : idx === 1 
                              ? "Will share the report by EOD." 
                              : "Got it, thanks!"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB: GROUPS ONLY */}
          {tab === "GROUP" && (
            <div className="space-y-1">
              {filteredGroups.map(group => {
                const isActive = activeChat?.id === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setActiveChat({ type: "GROUP", id: group.id, name: group.name, meta: group })}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-blue-50/70 border border-blue-100/80 shadow-xs' 
                        : 'hover:bg-slate-50/80 border border-transparent'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 border border-blue-100/70">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-xs text-slate-800 truncate">{group.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">{group.members.length} members</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">Tap to open team discussion</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: VISITOR / SUPPORT */}
          {tab === "VISITOR" && (
            <div className="space-y-1">
              {filteredVisitors.map(v => {
                const isActive = activeChat?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveChat({
                      type: "VISITOR",
                      id: v.id,
                      name: v.visitorName,
                      meta: { email: v.email, phone: v.phone, ipAddress: v.ipAddress, userAgent: v.userAgent, createdAt: v.createdAt }
                    })}
                    className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-blue-50/70 border border-blue-100/80 shadow-xs' 
                        : 'hover:bg-slate-50/80 border border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        {v.visitorName.charAt(0)}
                      </div>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-semibold text-xs text-slate-800 truncate">{v.visitorName}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(v.updatedAt || v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{v.email || "Website Inquiry"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </aside>

      {/* =========================================================================
          PANEL 2 (CENTER): Main Chat Window (Messages & Input)
         ========================================================================= */}
      <main className={`flex-1 flex flex-col bg-[#fafcff] ${!activeChat ? 'hidden md:flex' : 'flex'} relative`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">Your Messages</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Select a conversation from the left to start messaging team members or website visitors.
            </p>
          </div>
        ) : (
          <>
            {/* Active Chat Header */}
            <header className="h-[74px] px-6 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0 z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <button 
                  className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 -ml-2 rounded-lg"
                  onClick={() => setActiveChat(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar with status */}
                <div 
                  className="relative flex-shrink-0 cursor-pointer"
                  onClick={() => setShowContactDetails(!showContactDetails)}
                >
                  {activeChat.type === "GROUP" ? (
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : activeUserObj?.image ? (
                    <img
                      src={activeUserObj.image}
                      alt={activeChat.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm uppercase">
                      {activeChat.name.charAt(0)}
                    </div>
                  )}
                  {activeChat.type !== "GROUP" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                  )}
                </div>

                {/* User / Group Title & Status */}
                <div 
                  className="cursor-pointer min-w-0"
                  onClick={() => setShowContactDetails(!showContactDetails)}
                >
                  <h2 className="font-bold text-sm text-slate-900 truncate flex items-center gap-2">
                    <span>{activeChat.name}</span>
                    {activeChat.type === "VISITOR" && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                        Support
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Search, Video Call, Voice Call, Contact Details / More */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button 
                  title="Search in conversation"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  title="Start voice call"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowContactDetails(!showContactDetails)}
                  title="Toggle Contact Details"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    showContactDetails ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Conversation Messages Viewport */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              
              {/* Date divider (Sat, 24 Oct 2026) */}
              <div className="flex justify-center my-2">
                <span className="px-3.5 py-1 rounded-full bg-slate-100/90 text-slate-500 text-[11px] font-medium tracking-wide">
                  Sat, 24 Oct 2026
                </span>
              </div>

              {/* Messages List */}
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
                  <div className="px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-xs">
                    Start conversation with {activeChat.name}...
                  </div>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === currentUserId;
                  const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  if (msg.isDeleted) {
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className="px-4 py-2 text-xs italic text-slate-400 bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center gap-1.5">
                          <span>🚫</span> This message was deleted
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id} 
                      className={`group flex items-end gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Incoming avatar (only for received messages) */}
                      {!isMine && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-slate-100">
                          {activeUserObj?.image ? (
                            <img src={activeUserObj.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                              {msg.sender?.name?.charAt(0) || activeChat.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bubble Container */}
                      <div className={`relative max-w-[72%] sm:max-w-[62%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {/* Sender name for group */}
                        {activeChat.type === "GROUP" && !isMine && (
                          <span className="text-[10px] font-bold text-blue-600 mb-1 ml-2">
                            {msg.sender?.name || "Member"}
                          </span>
                        )}

                        {/* Speech Bubble */}
                        <div 
                          className={`px-4 py-3 text-[13px] leading-relaxed transition-all shadow-xs ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-3xl rounded-br-xs font-normal'
                              : 'bg-white text-slate-800 rounded-3xl rounded-bl-xs border border-slate-100 shadow-slate-100'
                          }`}
                        >
                          <div className="break-words">
                            {renderMessageText(msg.message, isMine)}
                          </div>
                        </div>

                        {/* Timestamp & Delivery Checkmarks */}
                        <div className="flex items-center gap-1.5 mt-1 mx-1.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {timeFormatted}
                          </span>

                          {isMine && (
                            <span className="inline-flex items-center text-blue-600 font-bold">
                              <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          )}

                          {/* Quick AI reply button for incoming messages */}
                          {!isMine && (
                            <button
                              type="button"
                              onClick={() => handleAiSuggestReply(undefined, { id: msg.id, text: msg.message, senderName: msg.sender?.name || activeChat?.name })}
                              disabled={isAiGeneratingChat}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 px-1.5 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[10px] font-semibold text-purple-700 border border-purple-200/60 flex items-center gap-1"
                              title="Smart AI Reply"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>AI Reply</span>
                            </button>
                          )}

                          {/* Delete message button */}
                          <button
                            type="button"
                            onClick={() => setDeleteMenuId(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 p-0.5"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar (Attachment, Emoji, Text Input, Send Button) */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 relative">
              
              {/* EMOJI PICKER POPOVER */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-6 mb-3 w-[320px] bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Quick Emojis</span>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-3 text-[11px] font-semibold">
                    {(["frequent", "finance", "smileys", "gestures"] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEmojiCategory(cat)}
                        className={`flex-1 py-1 rounded-lg capitalize transition-all ${
                          emojiCategory === cat ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-500"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-6 gap-2 p-1 max-h-40 overflow-y-auto">
                    {EMOJI_CATEGORIES[emojiCategory].map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                        }}
                        className="w-9 h-9 flex items-center justify-center text-lg hover:scale-125 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI ASSISTANT POPUP */}
              {isAiPopupOpen && (
                <div className="absolute bottom-full left-6 right-6 mb-3 bg-white rounded-2xl p-4 border border-purple-200/90 shadow-2xl z-30">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Finsocap AI Smart Assistant</h4>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIsAiPopupOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Prompt AI (e.g. Ask for GST certificate, confirm meeting...)"
                      value={aiCustomPrompt}
                      onChange={e => setAiCustomPrompt(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && aiCustomPrompt.trim()) {
                          e.preventDefault();
                          handleAiSuggestReply(aiCustomPrompt);
                          setIsAiPopupOpen(false);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (aiCustomPrompt.trim()) {
                          handleAiSuggestReply(aiCustomPrompt);
                          setIsAiPopupOpen(false);
                        }
                      }}
                      disabled={!aiCustomPrompt.trim() || isAiGeneratingChat}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                    >
                      Draft
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleAiSuggestReply();
                        setIsAiPopupOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold border border-purple-200/60"
                    >
                      ✨ Auto-Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAiSuggestReply("Write a polite confirmation that documents are received and in verification");
                        setIsAiPopupOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200"
                    >
                      📑 Docs Received
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAiSuggestReply("Confirm appointment scheduled for today 4 PM with calendar invite");
                        setIsAiPopupOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200"
                    >
                      📅 Meeting Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                
                {/* Paperclip Attachment button */}
                <button
                  type="button"
                  title="Attach file"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex-shrink-0"
                >
                  <Paperclip className="w-5 h-5 -rotate-45" />
                </button>

                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all flex-shrink-0"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Text input field */}
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
                  />

                  {/* Finsocap AI Badge inside input */}
                  <button
                    type="button"
                    onClick={() => setIsAiPopupOpen(!isAiPopupOpen)}
                    title="Finsocap AI"
                    className="absolute right-3 px-2 py-1 rounded-full text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span className="hidden sm:inline">AI</span>
                  </button>
                </div>

                {/* Blue circular send button */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  title="Send"
                  className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>

            </div>
          </>
        )}
      </main>

      {/* =========================================================================
          PANEL 3 (RIGHT): Contact Details (Collapsible Sidebar)
         ========================================================================= */}
      {showContactDetails && activeChat && (
        <aside className="w-[300px] lg:w-[320px] flex-shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-y-auto animate-in slide-in-from-right-4 duration-200">
          
          {/* Header with Title & Close X */}
          <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Contact Details</h3>
            <button 
              onClick={() => setShowContactDetails(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            
            {/* Profile Overview (Avatar, Name, Role Badge) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                {activeChat.type === "GROUP" ? (
                  <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border-2 border-blue-100 shadow-sm">
                    <Users className="w-9 h-9" />
                  </div>
                ) : activeUserObj?.image ? (
                  <img
                    src={activeUserObj.image}
                    alt={activeChat.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
                    {activeChat.name.charAt(0)}
                  </div>
                )}
                {activeChat.type !== "GROUP" && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0.5 right-0.5" />
                )}
              </div>

              <h4 className="font-bold text-base text-slate-900 mb-0.5">{activeChat.name}</h4>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activeUserObj?.role || (activeChat.type === "GROUP" ? "TEAM GROUP" : "ADMIN")}
              </span>
            </div>

            {/* Circular Action Icons: Message, Call, More */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <button className="flex flex-col items-center gap-1.5 group">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:bg-blue-700 transition-all">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Message</span>
              </button>

              <button className="flex flex-col items-center gap-1.5 group">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-200 transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Call</span>
              </button>

              <button 
                onClick={() => promptDeleteChat(activeChat.id, activeChat.name, activeChat.type === "VISITOR")}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">More</span>
              </button>
            </div>

            {/* About Card */}
            <div>
              <h5 className="text-xs font-bold text-slate-900 mb-1.5">About</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeUserObj?.about || 
                  (activeChat.type === "GROUP"
                    ? "Official Finsocap communication group for operational coordination, client file approvals, and team sync."
                    : "Managing partner at Finsocap. Focused on growth, client success and long-term partnerships.")}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-800">
                  {activeUserObj?.phone || "+91 98765 43210"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-800 truncate">
                  {activeUserObj?.email || `${activeChat.name.toLowerCase().replace(/\s+/g, '')}@finsocap.com`}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-800">
                  {activeUserObj?.city ? `${activeUserObj.city}, ${activeUserObj.state || 'India'}` : "Ghaziabad, Uttar Pradesh"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-0.5 flex-shrink-0" />
                <span className="font-semibold text-emerald-600">Online</span>
              </div>
            </div>

            {/* Shared Files Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-900">Shared Files</h5>
                <button className="text-[11px] font-bold text-blue-600 hover:underline">
                  See all
                </button>
              </div>

              <div className="space-y-2.5">
                {/* File 1: PDF */}
                <div className="p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 flex items-center gap-3 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="font-semibold text-xs text-slate-800 truncate">Client_Report_Finsocap.pdf</h6>
                    <span className="text-[10px] text-slate-400">2.4 MB • Today, 10:12 AM</span>
                  </div>
                </div>

                {/* File 2: Word / DOCX */}
                <div className="p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 flex items-center gap-3 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="font-semibold text-xs text-slate-800 truncate">Meeting_Agenda.docx</h6>
                    <span className="text-[10px] text-slate-400">1.1 MB • Yesterday, 04:32 PM</span>
                  </div>
                </div>

                {/* File 3: Excel / XLSX */}
                <div className="p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 flex items-center gap-3 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="font-semibold text-xs text-slate-800 truncate">KYC_Status.xlsx</h6>
                    <span className="text-[10px] text-slate-400">892 KB • Fri, 11:20 AM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </aside>
      )}

      {/* =========================================================================
          MODALS & OVERLAYS: Create Group, Manage Members, Delete Confirmation
         ========================================================================= */}
      
      {/* CREATE GROUP MODAL */}
      {showCreateGroup && (
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-3xl p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <ModalHeaderBanner
              icon={Users}
              badge="COLLABORATION HUB"
              title="Create Team Group"
              description="Assemble operations specialists and coordinators into a private discussion space."
              badgeTag="New Group"
              onClose={() => setShowCreateGroup(false)}
            />

            <input 
              type="text" 
              placeholder="Group Name" 
              value={newGroupName} 
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-sm"
            />
            <div className="h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newGroupMembers.includes(u.id)} 
                    onChange={(e) => {
                      if (e.target.checked) setNewGroupMembers([...newGroupMembers, u.id]);
                      else setNewGroupMembers(newGroupMembers.filter(id => id !== u.id));
                    }} 
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                </label>
              ))}
            </div>
            <button 
              onClick={createGroup} 
              className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25"
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      {/* MANAGE MEMBERS MODAL */}
      {showManageMembers && activeChat?.type === "GROUP" && (
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-3xl p-4">
          <div className="bg-white dark:bg-[#0c1427] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] space-y-4">
            <ModalHeaderBanner
              icon={Users}
              badge="GROUP PARTICIPANTS"
              title="Manage Members"
              description={`Add or remove personnel from ${activeChat.name || "group discussion"}.`}
              badgeTag="Access"
              onClose={() => setShowManageMembers(false)}
            />
            
            <div className="flex-1 overflow-y-auto mb-4 border border-slate-200 rounded-xl p-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-2">Current Members</h3>
              {activeChat.meta?.members?.map((m: any) => (
                <div key={m.user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{m.user.name}</span>
                  {m.user.id !== currentUserId && (
                    <button onClick={() => removeMemberFromGroup(m.user.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                      <UserMinus className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              ))}
              
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Add Others</h3>
              {users.filter(u => !activeChat.meta?.members?.some((m:any) => m.user.id === u.id)).map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{u.name}</span>
                  <button onClick={() => addMemberToGroup(u.id)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg">
                    <UserPlus className="w-4 h-4"/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SINGLE MESSAGE DELETE MENU */}
      {deleteMenuId && (() => {
        const targetMsg = messages.find(m => m.id === deleteMenuId);
        if (!targetMsg) return null;
        const isMine = targetMsg.senderId === currentUserId;
        const isVisitorThread = activeChat?.type === "VISITOR";

        return (
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4 rounded-3xl"
            onClick={() => setDeleteMenuId(null)}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              
              <h3 className="text-base font-bold text-slate-800 mb-1">Delete message?</h3>
              <p className="text-xs text-slate-500 mb-5 max-w-xs">
                {isVisitorThread 
                  ? "Choose confirmation to permanently delete this message."
                  : isMine 
                  ? "Choose whether to remove this message for everyone or just yourself."
                  : "Remove this message from your device."}
              </p>

              <div className="w-full flex flex-col gap-2">
                {isVisitorThread ? (
                  <button 
                    onClick={() => promptDeleteMessage(targetMsg, 'visitor_msg')}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all"
                  >
                    Delete message
                  </button>
                ) : (
                  <>
                    {isMine && (
                      <button 
                        onClick={() => promptDeleteMessage(targetMsg, 'everyone')}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all"
                      >
                        Delete for everyone
                      </button>
                    )}
                    
                    <button 
                      onClick={() => promptDeleteMessage(targetMsg, 'me')}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Delete for me
                    </button>
                  </>
                )}

                <button 
                  onClick={() => setDeleteMenuId(null)}
                  className="w-full py-2 px-4 text-slate-500 hover:text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* UNIVERSAL CONFIRMATION MODAL */}
      {deleteConfirmation?.isOpen && (
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 rounded-3xl"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              {deleteConfirmation.title}
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed px-2">
              {deleteConfirmation.description}
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button 
                type="button"
                onClick={executeConfirmedDelete}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all"
              >
                Yes, Confirm Delete
              </button>
              
              <button 
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel / Keep It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
