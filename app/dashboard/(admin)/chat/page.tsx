"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Search, CheckCheck, Users, Plus, X, UserMinus, UserPlus, Trash2, Sparkles, Bot, Wand2, MessageSquare, Loader2, Lightbulb, Smile, Paperclip, SendHorizonal, Heart, Zap, ThumbsUp, Laugh, PartyPopper, Check } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import AccessDenied from "@/components/Dashboard/AccessDenied";

type ChatUser = { id: string; name: string; role: string; image?: string | null; lastSeen?: string; isOnline?: boolean };
type Group = { id: string; name: string; createdBy: string; members: { user: ChatUser }[] };
type Message = { id: string; senderId: string; receiverId?: string; groupId?: string; message: string; createdAt: string; sender?: { id: string; name: string; image?: string | null }; isDeleted?: boolean; deletedFor?: string; isDelivered?: boolean; isRead?: boolean };

export default function ChatPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const canViewVisitors = userRole === "ADMIN" || userRole === "MANAGER";

  const [tab, setTab] = useState<"DIRECT" | "GROUP" | "VISITOR">("DIRECT");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [visitorChats, setVisitorChats] = useState<any[]>([]);
  
  const [activeChat, setActiveChat] = useState<{ type: "USER" | "GROUP" | "VISITOR"; id: string; name: string; meta?: any } | null>(null);
  
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
  const [aiTone, setAiTone] = useState<"professional" | "polite" | "urgency" | "sales">("professional");
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
    const res = await fetch("/api/chat/users");
    if (res.ok) setUsers(await res.json());
  };

  const fetchGroups = async () => {
    const res = await fetch("/api/chat/groups");
    if (res.ok) setGroups(await res.json());
  };

  const fetchVisitorChats = async () => {
    if (!canViewVisitors) return;
    try {
      const res = await fetch("/api/support/admin");
      if (res.ok) setVisitorChats(await res.json());
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

    // Presence heartbeat: keeps current user online & marks incoming messages as delivered
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

            // Map visitor message to chat message interface
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
          setMessages(data);
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
        if (tab === "VISITOR") fetchVisitorChats();
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
      // Find context: specific message passed OR latest message from the other person
      let contextMsgText = "";
      if (targetMessage?.text) {
        contextMsgText = targetMessage.text;
      } else {
        const lastMsg = [...messages].reverse().find(m => m.senderId !== currentUserId);
        contextMsgText = lastMsg ? lastMsg.message : `Conversation started with ${activeChat.name}`;
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
    // Update local meta
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
    // Update local meta
    const g = groups.find(g => g.id === activeChat.id);
    if (g) {
      setActiveChat({ ...activeChat, meta: { ...g, members: g.members.filter(m => m.user.id !== userId) } });
    }
  };

  // Execute the confirmed deletion action
  const executeConfirmedDelete = async () => {
    if (!deleteConfirmation) return;
    const { actionPayload } = deleteConfirmation;

    // 1. Delete Single Message
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
    } 
    // 2. Delete Entire Conversation
    else if (actionPayload.chatId) {
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
        // Clear all messages in current direct user chat
        setMessages([]);
        try {
          // Delete every visible message in the thread for current user
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
    const isMine = msg.senderId === currentUserId;
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


  // Tag Highlight Helper
  const renderMessage = (text: string, isMine: boolean) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <strong key={i} className={isMine ? "text-indigo-100 font-bold bg-white/20 px-1.5 py-0.5 rounded" : "text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded"}>{part}</strong>;
      }
      return part;
    });
  };

  const renderActiveMessage = (msg: Message, isMine: boolean) => {
    if (msg.isDeleted) {
      return (
        <div className={`px-5 py-3.5 text-sm italic text-slate-400 bg-slate-100 rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'} border border-slate-200 flex items-center gap-2`}>
          <span>🚫</span> This message was deleted
        </div>
      );
    }

    return (
      <div className={`group relative flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div 
          className={`px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all
            ${isMine 
              ? 'bg-gradient-to-r from-[#1b2b5a] via-[#243b78] to-[#0da687] text-white rounded-3xl rounded-br-xs shadow-md shadow-[#1b2b5a]/20' 
              : (msg as any).isAi 
              ? 'bg-purple-50/80 text-purple-950 rounded-3xl rounded-bl-xs border border-purple-200 shadow-purple-500/10'
              : 'bg-white text-slate-800 rounded-3xl rounded-bl-xs border border-slate-200/80 shadow-slate-200/50'}`}
        >
          {activeChat?.type === "GROUP" && !isMine && (
            <p className="text-[11px] font-bold text-[#0da687] mb-1">{msg.sender?.name}</p>
          )}

          {activeChat?.type === "VISITOR" && !isMine && (
            <p className="text-[11px] font-bold mb-1 flex items-center gap-1">
              {(msg as any).isAi ? (
                <span className="text-purple-600 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3" /> Finsocap AI (Auto-Reply)
                </span>
              ) : (
                <span className="text-blue-600 font-bold">👤 {msg.sender?.name || activeChat.name}</span>
              )}
            </p>
          )}

          <div className="break-words font-normal">
            {renderMessage(msg.message, isMine)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 mx-1 relative">
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMine && (
            msg.isRead ? (
              // 3. SEEN / READ: Double Blue Tick (WhatsApp sky blue)
              <span title="Seen" className="inline-flex items-center text-sky-500 font-bold">
                <CheckCheck className="w-3.5 h-3.5" />
              </span>
            ) : msg.isDelivered ? (
              // 2. DELIVERED: Double Grey Tick
              <span title="Delivered" className="inline-flex items-center text-slate-400">
                <CheckCheck className="w-3.5 h-3.5" />
              </span>
            ) : (
              // 1. SENT: Single Grey Tick
              <span title="Sent" className="inline-flex items-center text-slate-400">
                <Check className="w-3.5 h-3.5" />
              </span>
            )
          )}

          {/* Direct AI Reply to this specific incoming message */}
          {!isMine && (
            <button
              type="button"
              onClick={() => handleAiSuggestReply(undefined, { id: msg.id, text: msg.message, senderName: msg.sender?.name || activeChat?.name })}
              disabled={isAiGeneratingChat}
              className="opacity-75 sm:opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-2 py-0.5 rounded-full transition-all active:scale-95 ml-1.5 shadow-xs"
              title="Generate Finsocap AI reply for this message"
            >
              {aiGeneratingForMsgId === msg.id ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                  <span>Drafting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI Reply</span>
                </>
              )}
            </button>
          )}
          
          <button 
            onClick={() => setDeleteMenuId(msg.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 ml-1 transition-opacity p-1 rounded hover:bg-slate-100"
            title="Delete message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };


  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (session && userRole === "WRITER") {
    return (
      <AccessDenied 
        title="You Don't Have Access to Live Chat"
        description="Aapke paas Live Chat ka access nahi hai. Ye section administrators aur managers ke liye reserved hai."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-144px)] bg-slate-50 overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative">
      
      {/* 1. LEFT PANE: Contact List */}
      <div className={`w-full md:w-[320px] lg:w-[350px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header & Search */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Messages
            </h1>
            <div className="flex items-center gap-2">

              {tab === "GROUP" && isAdmin && (
                <button onClick={() => setShowCreateGroup(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            <input
              type="text"
              placeholder={`Search ${tab.toLowerCase()}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4 border-b border-slate-100 pb-2 overflow-x-auto">
            <button 
              onClick={() => setTab("DIRECT")} 
              className={`${tab === "DIRECT" ? "text-[#1b2b5a] border-b-2 border-[#0da687] font-bold" : "hover:text-slate-600"} pb-2 -mb-[9px] whitespace-nowrap`}
            >
              Direct
            </button>
            <button 
              onClick={() => setTab("GROUP")} 
              className={`${tab === "GROUP" ? "text-[#1b2b5a] border-b-2 border-[#0da687] font-bold" : "hover:text-slate-600"} pb-2 -mb-[9px] whitespace-nowrap`}
            >
              Groups
            </button>
            {canViewVisitors && (
              <button 
                onClick={() => setTab("VISITOR")} 
                className={`${tab === "VISITOR" ? "text-[#0da687] border-b-2 border-[#0da687] font-bold" : "hover:text-slate-600"} pb-2 -mb-[9px] whitespace-nowrap flex items-center gap-1.5`}
              >
                <span>Website Support</span>
                {visitorChats.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {visitorChats.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Contacts / Groups / Website Visitors */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {tab === "DIRECT" ? (
            filteredUsers.map(user => (
              <div 
                key={user.id} 
                onClick={() => setActiveChat({ type: "USER", id: user.id, name: user.name, meta: { image: user.image } })}
                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${activeChat?.id === user.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
              >
                <div className="relative flex-shrink-0">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg uppercase shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm truncate ${activeChat?.id === user.id ? 'text-indigo-900' : 'text-slate-800'}`}>{user.name}</h3>
                    <span className={`text-[10px] font-semibold ${user.isOnline ? "text-emerald-600" : "text-slate-400"}`}>
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.role}</p>
                </div>
              </div>
            ))
          ) : tab === "GROUP" ? (
            filteredGroups.map(group => (
              <div 
                key={group.id} 
                onClick={() => setActiveChat({ type: "GROUP", id: group.id, name: group.name, meta: group })}
                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${activeChat?.id === group.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm truncate ${activeChat?.id === group.id ? 'text-indigo-900' : 'text-slate-800'}`}>{group.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{group.members.length} members</p>
                </div>
              </div>
            ))
          ) : (
            // TAB === "VISITOR" (Website Live Support)
            visitorChats.filter(v => v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || v.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(v => (
              <div 
                key={v.id} 
                onClick={() => setActiveChat({ 
                  type: "VISITOR", 
                  id: v.id, 
                  name: v.visitorName, 
                  meta: { email: v.email, phone: v.phone, ipAddress: v.ipAddress, userAgent: v.userAgent, createdAt: v.createdAt } 
                })}
                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${activeChat?.id === v.id ? 'bg-blue-50/80 border-blue-200' : 'hover:bg-slate-50 border-transparent'}`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {v.visitorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-1">
                      <h3 className={`font-bold text-xs truncate ${activeChat?.id === v.id ? 'text-blue-950' : 'text-slate-800'}`}>{v.visitorName}</h3>
                      <p className="text-[11px] text-slate-500 truncate">{v.email} {v.phone ? `• 📞 ${v.phone}` : ''}</p>
                    </div>

                    {/* Time & Delete Button right below time */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(v.updatedAt || v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          promptDeleteChat(v.id, v.visitorName, true);
                        }}
                        className="p-1 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete this visitor chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      IP: {v.ipAddress || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* 2. MIDDLE PANE: Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#F8FAFC] ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select a chat to start messaging</div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-[88px] px-8 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500 p-2" onClick={() => setActiveChat(null)}>←</button>
                {activeChat.type === "GROUP" ? (
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold shadow-inner">
                    <Users className="w-6 h-6" />
                  </div>
                ) : activeChat.type === "VISITOR" ? (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                ) : activeChat.meta?.image || users.find(u => u.id === activeChat.id)?.image ? (
                  <img
                    src={activeChat.meta?.image || users.find(u => u.id === activeChat.id)?.image || ""}
                    alt={activeChat.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg uppercase shadow-inner">
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg text-slate-800">{activeChat.name}</h2>
                    {activeChat.type === "VISITOR" && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        Website Visitor
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    {activeChat.type === "GROUP" ? (
                      <span>{activeChat.meta?.members?.length || 0} Members</span>
                    ) : activeChat.type === "VISITOR" ? (
                      <>
                        <span>{activeChat.meta?.email}</span>
                        {activeChat.meta?.phone && (
                          <>
                            <span>•</span>
                            <a
                              href={`tel:${activeChat.meta.phone}`}
                              className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                              title="Call visitor directly"
                            >
                              📞 {activeChat.meta.phone}
                            </a>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">IP: {activeChat.meta?.ipAddress || "Unknown"}</span>
                      </>
                    ) : (() => {
                      const userObj = users.find(u => u.id === activeChat.id);
                      const isOnline = userObj?.isOnline;
                      return (
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                          <span className={isOnline ? "text-emerald-600 font-bold" : "text-slate-400"}>
                            {isOnline ? "Active now" : "Offline"}
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeChat.type === "GROUP" && isAdmin && (
                  <button onClick={() => setShowManageMembers(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                    Manage Members
                  </button>
                )}

                {/* Delete Entire Conversation Button */}
                <button
                  type="button"
                  onClick={() => promptDeleteChat(activeChat.id, activeChat.name, activeChat.type === "VISITOR")}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-600 transition-all flex items-center gap-1.5 shadow-xs"
                  title={activeChat.type === "VISITOR" ? "Delete Visitor Chat" : "Clear Chat History"}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden sm:inline">Delete Chat</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-10 bg-white py-2 px-4 rounded-full inline-block mx-auto">Start the conversation...</div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      {!isMine && (
                         <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase flex-shrink-0 mb-5">
                           {msg.sender ? msg.sender.name.charAt(0) : activeChat.name.charAt(0)}
                         </div>
                      )}
                      
                      {renderActiveMessage(msg, isMine)}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Integrated Finsocap AI Assistant & Emoji Picker */}
            <div className="p-3 sm:p-5 bg-white/95 backdrop-blur-md border-t border-slate-200/80 relative">
              
              {/* EMOJI PICKER POPOVER */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-4 sm:left-6 mb-3 w-[320px] bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-200 shadow-2xl shadow-indigo-950/15 z-30 animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-base">😊</span>
                      <span className="text-xs font-bold text-slate-800">Quick Emojis</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Emoji Category Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl mb-3 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setEmojiCategory("frequent")}
                      className={`flex-1 py-1 rounded-lg transition-all ${emojiCategory === "frequent" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Popular
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmojiCategory("finance")}
                      className={`flex-1 py-1 rounded-lg transition-all ${emojiCategory === "finance" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Finance
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmojiCategory("smileys")}
                      className={`flex-1 py-1 rounded-lg transition-all ${emojiCategory === "smileys" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Smiles
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmojiCategory("gestures")}
                      className={`flex-1 py-1 rounded-lg transition-all ${emojiCategory === "gestures" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Hands
                    </button>
                  </div>

                  {/* Emoji Grid */}
                  <div className="grid grid-cols-6 gap-2 p-1 max-h-44 overflow-y-auto">
                    {EMOJI_CATEGORIES[emojiCategory].map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                        }}
                        className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Quick preset reactions */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Click to insert into message</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewMessage(prev => prev + " 👍");
                        setShowEmojiPicker(false);
                      }}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Quick 👍
                    </button>
                  </div>
                </div>
              )}

              {/* AI Popover / Quick Suggestions Drawer */}
              {isAiPopupOpen && (
                <div className="absolute bottom-full left-4 right-4 mb-3 bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-purple-200/80 shadow-2xl shadow-purple-950/15 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          Finsocap AI Live Assistant
                          <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Active</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">Smart contextual client replies tailored for Finsocap</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setAiLanguage("english")}
                          className={`px-2 py-0.5 rounded-md transition-all ${aiLanguage === "english" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiLanguage("hinglish")}
                          className={`px-2 py-0.5 rounded-md transition-all ${aiLanguage === "hinglish" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          Hinglish
                        </button>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => setIsAiPopupOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                        Ask AI to craft a tailored reply (or choose a quick preset):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Acknowledge documents, ask for ITR acknowledgement, explain health cover..."
                          value={aiCustomPrompt}
                          onChange={e => setAiCustomPrompt(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (aiCustomPrompt.trim()) {
                                handleAiSuggestReply(aiCustomPrompt);
                                setIsAiPopupOpen(false);
                              }
                            }
                          }}
                          className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-slate-800"
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
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          {isAiGeneratingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wand2 className="w-3.5 h-3.5" /> <span>Draft</span></>}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        One-Click Smart Templates:
                      </span>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleAiSuggestReply();
                            setIsAiPopupOpen(false);
                          }}
                          disabled={isAiGeneratingChat}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200/60 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          Auto-Reply to Last Message
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAiSuggestReply("Write a polite message asking the client for a convenient time for a quick 5-minute call");
                            setIsAiPopupOpen(false);
                          }}
                          disabled={isAiGeneratingChat}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95"
                        >
                          📞 Request Callback
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAiSuggestReply("Share Finsocap 51+ insurance partner comparison benefits and lowest price guarantee");
                            setIsAiPopupOpen(false);
                          }}
                          disabled={isAiGeneratingChat}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95"
                        >
                          🛡️ Insurance Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAiSuggestReply("Ask client for KYC documents (Aadhaar, PAN, 3 months bank statement) for loan eligibility");
                            setIsAiPopupOpen(false);
                          }}
                          disabled={isAiGeneratingChat}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95"
                        >
                          📑 Request KYC Docs
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAiSuggestReply("Send an official warm thank you message for choosing Finsocap Financial Services");
                            setIsAiPopupOpen(false);
                          }}
                          disabled={isAiGeneratingChat}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-all active:scale-95"
                        >
                          🙏 Thank You
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODERN CREATIVE INPUT FORM */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 flex items-center bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-indigo-500 rounded-2xl px-3 sm:px-4 py-2 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm transition-all duration-200">
                  
                  {/* Left: Finsocap AI Assistant Trigger Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiPopupOpen(!isAiPopupOpen);
                      setShowEmojiPicker(false);
                    }}
                    title="Finsocap AI Assistant"
                    className={`mr-2 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                      isAiPopupOpen 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 scale-105' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 active:scale-95 border border-purple-200/70 hover:shadow-xs'
                    }`}
                  >
                    {isAiGeneratingChat ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    ) : (
                      <Sparkles className={`w-3.5 h-3.5 ${isAiPopupOpen ? 'text-white' : 'text-purple-600'}`} />
                    )}
                    <span className="hidden sm:inline text-[11px] font-semibold tracking-wide">Finsocap AI</span>
                  </button>

                  {/* Message Input Field */}
                  <input
                    type="text"
                    placeholder="Type your message... (press Enter to send)"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 py-1.5 min-w-0"
                  />

                  {/* AI Drafting Indicator Badge */}
                  {isAiGeneratingChat && (
                    <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1 animate-pulse mr-2 shrink-0 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      <Sparkles className="w-3 h-3 animate-spin" /> Drafting reply...
                    </span>
                  )}

                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setIsAiPopupOpen(false);
                    }}
                    title="Insert Emoji"
                    className={`p-1.5 rounded-xl transition-all text-slate-400 hover:text-amber-500 hover:bg-amber-50 active:scale-95 ml-1 ${showEmojiPicker ? 'text-amber-500 bg-amber-50 ring-2 ring-amber-300' : ''}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                {/* ANIMATED CREATIVE SEND BUTTON */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  title="Send message"
                  className={`relative group overflow-hidden h-12 sm:h-12 px-4 sm:px-5 flex items-center justify-center rounded-2xl font-semibold text-white transition-all duration-300 shadow-md shrink-0 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none ${
                    newMessage.trim()
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 hover:-translate-y-0.5'
                      : 'bg-slate-300 shadow-none'
                  }`}
                >
                  {/* Subtle glowing animated backdrop */}
                  <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="hidden sm:inline text-xs font-bold tracking-wide">Send</span>
                    <SendHorizonal className="w-4 h-4 sm:w-4 sm:h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreateGroup && (
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-2xl p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Create Group</h2>
              <button onClick={() => setShowCreateGroup(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
            </div>
            <input 
              type="text" 
              placeholder="Group Name" 
              value={newGroupName} 
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-slate-800 text-sm"
            />
            <div className="h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 mb-6">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <input type="checkbox" checked={newGroupMembers.includes(u.id)} onChange={(e) => {
                    if (e.target.checked) setNewGroupMembers([...newGroupMembers, u.id]);
                    else setNewGroupMembers(newGroupMembers.filter(id => id !== u.id));
                  }} />
                  <span className="text-sm font-medium text-slate-700">{u.name}</span>
                </label>
              ))}
            </div>
            <button onClick={createGroup} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">Create</button>
          </div>
        </div>
      )}

      {/* MANAGE MEMBERS MODAL */}
      {showManageMembers && activeChat?.type === "GROUP" && (
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-50 rounded-2xl p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Manage Members</h2>
              <button onClick={() => setShowManageMembers(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 border border-slate-200 rounded-lg p-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-2">Current Members</h3>
              {activeChat.meta?.members?.map((m: any) => (
                <div key={m.user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm font-medium text-slate-700">{m.user.name}</span>
                  {m.user.id !== currentUserId && (
                    <button onClick={() => removeMemberFromGroup(m.user.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><UserMinus className="w-4 h-4"/></button>
                  )}
                </div>
              ))}
              
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Add Others</h3>
              {users.filter(u => !activeChat.meta?.members?.some((m:any) => m.user.id === u.id)).map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm font-medium text-slate-700">{u.name}</span>
                  <button onClick={() => addMemberToGroup(u.id)} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded"><UserPlus className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. MESSAGE MENU SELECTION (For direct messages: 'Delete for me' vs 'Delete for everyone') */}
      {deleteMenuId && (() => {
        const targetMsg = messages.find(m => m.id === deleteMenuId);
        if (!targetMsg) return null;
        const isMine = targetMsg.senderId === currentUserId;
        const isVisitorThread = activeChat?.type === "VISITOR";

        return (
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4 rounded-2xl transition-all"
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
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all active:scale-98"
                  >
                    Delete message
                  </button>
                ) : (
                  <>
                    {isMine && (
                      <button 
                        onClick={() => promptDeleteMessage(targetMsg, 'everyone')}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all active:scale-98"
                      >
                        Delete for everyone
                      </button>
                    )}
                    
                    <button 
                      onClick={() => promptDeleteMessage(targetMsg, 'me')}
                      className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-98"
                    >
                      Delete for me
                    </button>
                  </>
                )}

                <button 
                  onClick={() => setDeleteMenuId(null)}
                  className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. UNIVERSAL DELETION CONFIRMATION POPUP MODAL (Guaranteed for Any Deletion) */}
      {deleteConfirmation?.isOpen && (
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 rounded-2xl transition-all"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4 shadow-inner">
              <Trash2 className="w-7 h-7 animate-pulse" />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-1.5">
              {deleteConfirmation.title}
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed px-2">
              {deleteConfirmation.description}
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button 
                type="button"
                onClick={executeConfirmedDelete}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Confirm Delete</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
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
