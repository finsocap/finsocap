"use client";

import React, { useState } from "react";
import { 
  X, 
  Send, 
  Paperclip, 
  Loader2, 
  FileText, 
  Download, 
  AlertCircle, 
  MessageSquare,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import ModalHeaderBanner from "@/components/Dashboard/ModalHeaderBanner";
import { partnerPortalService, PartnerChatMessage } from "@/lib/api/partnerPortalService";
import { useToast } from "@/components/Global/ToastNotification";

interface PartnerChatDrawerProps {
  taskId: string | number;
  serviceName?: string;
  isClosed?: boolean; // Op 26: disable input if task is closed (COMPLETED or CANCELLED)
  onClose: () => void;
}

export default function PartnerChatDrawer({
  taskId,
  serviceName,
  isClosed = false,
  onClose
}: PartnerChatDrawerProps) {
  const toast = useToast();
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Poll & load messages via Op 25 (fetchMessagesWithPagination loop)
  const fetchMessages = React.useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const allMsgs = await partnerPortalService.chat.fetchAllMessages(taskId);
      setMessages(allMsgs);
    } catch (e: any) {
      if (isInitial) {
        toast.error(e?.message || "Failed to load chat messages", "Chat Error");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [taskId, toast]);

  // Initial load
  React.useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  // Poll every 5 seconds if not closed
  React.useEffect(() => {
    if (isClosed) return;
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [isClosed, fetchMessages]);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message via Op 26
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed) {
      toast.error("This task is closed. Further messages cannot be sent.", "Task Closed");
      return;
    }
    if (!inputText.trim() && !attachment) return;

    if (attachment && attachment.size > 10 * 1024 * 1024) {
      toast.error("Attachment exceeds maximum limit of 10 MB.", "File Too Large");
      return;
    }

    try {
      setSending(true);
      const res = await partnerPortalService.chat.sendMessage(
        taskId,
        inputText.trim() || undefined,
        attachment || undefined
      );

      if (res?.success && res?.data) {
        setMessages((prev) => [...prev, res.data]);
        setInputText("");
        setAttachment(null);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message", "Send Failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:w-[480px] h-full bg-white dark:bg-[#0c1427] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <ModalHeaderBanner
            icon={MessageSquare}
            badge="TASK COLLABORATION CHAT"
            title={`Task #${taskId}`}
            description={serviceName ? `${serviceName} · Real-time communications with assigned CA specialist.` : "Real-time communication with operations desk."}
            badgeTag="Op 25 & 26"
            onClose={onClose}
          />
        </div>

        {/* Task Closed Banner */}
        {isClosed && (
          <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This task has been resolved or cancelled. Chat is read-only.</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p>Loading conversation history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center px-4">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
              <p className="font-bold text-slate-600 dark:text-slate-400">No messages yet</p>
              <p className="text-[11px] mt-1">Start collaboration by asking a question or clarifying required documents.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isPartner = m.senderRole === "PARTNER";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isPartner ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {m.sender} ({m.senderRole})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      isPartner
                        ? "bg-blue-600 text-white rounded-br-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-xs"
                    }`}
                  >
                    {m.text && (
                      <p className="whitespace-pre-wrap leading-relaxed text-[12px]">{m.text}</p>
                    )}

                    {m.attachment && (
                      <div className={`mt-2 pt-2 border-t ${isPartner ? "border-blue-400/50" : "border-slate-200 dark:border-slate-700"} flex items-center justify-between gap-2`}>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[11px] font-mono truncate">
                            {m.attachment.fileName || "Attachment"}
                          </span>
                        </div>
                        <a
                          href={m.attachment.downloadPath}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            isPartner
                              ? "bg-blue-700 hover:bg-blue-800 text-white"
                              : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white"
                          }`}
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0 space-y-2"
        >
          {attachment && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate font-medium text-blue-900 dark:text-blue-300">{attachment.name}</span>
                <span className="text-[10px] text-slate-400">({(attachment.size / (1024 * 1024)).toFixed(1)} MB)</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-slate-600 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer transition-colors ${
                isClosed ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
              }`}
              title="Attach File (PDF, PNG, JPEG, max 10MB)"
            >
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                accept=".pdf,.png,.jpeg,.jpg"
                disabled={isClosed || sending}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAttachment(f);
                }}
              />
            </label>

            <input
              type="text"
              placeholder={isClosed ? "Chat is closed for this task" : "Type your message..."}
              disabled={isClosed || sending}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isClosed || sending || (!inputText.trim() && !attachment)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-40 transition-colors flex items-center justify-center shrink-0 shadow-sm"
              title="Send Message"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
