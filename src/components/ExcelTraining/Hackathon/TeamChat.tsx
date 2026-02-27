import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Users, Megaphone } from "lucide-react";
import { ChatMessage } from "./types";
import {
  sendTeamChatMessage,
  subscribeToTeamChat,
  subscribeToBroadcastChat,
} from "../../../config/firebase";

interface TeamChatProps {
  sessionId: string;
  teamId: number;
  teamName: string;
  userId: string;
  userName: string;
}

const TeamChat: React.FC<TeamChatProps> = ({
  sessionId,
  teamId,
  teamName,
  userId,
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSeenTimestampRef = useRef<number>(Date.now());
  const isSendingRef = useRef(false);

  // Merge équipe + broadcast triés par timestamp
  useEffect(() => {
    if (!sessionId || !teamId) return;

    let teamMessages: ChatMessage[] = [];
    let broadcastMessages: ChatMessage[] = [];

    const merge = () => {
      const merged = [...teamMessages, ...broadcastMessages].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      setMessages(merged);
      if (!isOpen) {
        const newUnread = merged.filter(
          (m) => m.timestamp > lastSeenTimestampRef.current
        ).length;
        setUnreadCount(newUnread);
      }
    };

    const unsubTeam = subscribeToTeamChat(sessionId, teamId, (msgs) => {
      teamMessages = msgs;
      merge();
    });

    const unsubBroadcast = subscribeToBroadcastChat(sessionId, (msgs) => {
      broadcastMessages = msgs;
      merge();
    });

    return () => {
      unsubTeam();
      unsubBroadcast();
    };
  }, [sessionId, teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    if (isOpen) {
      lastSeenTimestampRef.current = Date.now();
      setUnreadCount(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [isOpen]);

  // Scroll vers le bas à chaque nouveau message (si ouvert)
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isSendingRef.current) return;
    isSendingRef.current = true;
    const text = inputText.trim();
    setInputText("");
    await sendTeamChatMessage(sessionId, teamId, {
      senderId: userId,
      senderName: userName,
      text,
    });
    isSendingRef.current = false;
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Panneau de chat */}
      {isOpen && (
        <div
          className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col"
          style={{ width: "320px", height: "420px" }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white">{teamName}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 text-xs mt-6">
                Aucun message pour l'instant
              </p>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.senderId === userId;
                const isBroadcast = msg.type === "broadcast";

                if (isBroadcast) {
                  return (
                    <div
                      key={msg.id || idx}
                      className="bg-yellow-900/40 border border-yellow-700/50 rounded-lg p-2"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Megaphone size={11} className="text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-semibold">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-100">{msg.text}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col max-w-[80%] ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      {!isMine && (
                        <span className="text-xs text-gray-400 mb-0.5 ml-1">
                          {msg.senderName}
                        </span>
                      )}
                      <div
                        className={`px-3 py-1.5 rounded-2xl text-sm ${
                          isMine
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-500 mt-0.5 mx-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Champ d'envoi */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message à l'équipe..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                maxLength={500}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        title="Chat d'équipe"
      >
        <MessageCircle size={22} />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default TeamChat;
