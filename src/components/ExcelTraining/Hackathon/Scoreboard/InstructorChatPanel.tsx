import React, { useState, useEffect, useRef } from "react";
import { X, Send, Megaphone, MessageCircle, Users } from "lucide-react";
import { ChatMessage, Team } from "../types";
import {
  sendTeamChatMessage,
  sendBroadcastMessage,
  subscribeToTeamChat,
  subscribeToBroadcastChat,
} from "../../../../config/firebase";

interface InstructorChatPanelProps {
  sessionId: string;
  teams: Team[];
  onClose: () => void;
}

const InstructorChatPanel: React.FC<InstructorChatPanelProps> = ({
  sessionId,
  teams,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<number | "broadcast">("broadcast");
  const [teamMessages, setTeamMessages] = useState<Record<number, ChatMessage[]>>({});
  const [broadcastMessages, setBroadcastMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState<Record<string | number, number>>({});
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef<Record<string | number, number>>({});
  const isSendingRef = useRef(false);
  const teamIdsKey = teams.map((t) => t.id).join(",");

  // Abonnements Firebase
  useEffect(() => {
    if (!sessionId || teams.length === 0) return;
    const unsubscribers: (() => void)[] = [];

    teams.forEach((team) => {
      const unsub = subscribeToTeamChat(sessionId, team.id, (msgs) => {
        setTeamMessages((prev) => ({ ...prev, [team.id]: msgs }));
        const lastSeen = lastSeenRef.current[team.id] ?? 0;
        const newUnread = msgs.filter((m) => m.timestamp > lastSeen).length;
        setUnread((prev) => ({ ...prev, [team.id]: newUnread }));
      });
      unsubscribers.push(unsub);
    });

    const unsubBroadcast = subscribeToBroadcastChat(sessionId, (msgs) => {
      setBroadcastMessages(msgs);
      const lastSeen = lastSeenRef.current["broadcast"] ?? 0;
      const newUnread = msgs.filter((m) => m.timestamp > lastSeen).length;
      setUnread((prev) => ({ ...prev, broadcast: newUnread }));
    });
    unsubscribers.push(unsubBroadcast);

    return () => unsubscribers.forEach((u) => u());
  }, [sessionId, teamIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Marquer la chatroom active comme lue + scroll
  useEffect(() => {
    lastSeenRef.current[selectedId] = Date.now();
    setUnread((prev) => ({ ...prev, [selectedId]: 0 }));
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [teamMessages, broadcastMessages]);

  // Messages à afficher : pour une équipe, on mélange team + broadcast
  const currentMessages: ChatMessage[] =
    selectedId === "broadcast"
      ? broadcastMessages
      : [...(teamMessages[selectedId as number] ?? []), ...broadcastMessages].sort(
          (a, b) => a.timestamp - b.timestamp
        );

  const handleSend = async () => {
    if (!inputText.trim() || isSendingRef.current) return;
    isSendingRef.current = true;
    const text = inputText.trim();
    setInputText("");
    if (selectedId === "broadcast") {
      await sendBroadcastMessage(sessionId, { senderName: "Formateur", text });
    } else {
      await sendTeamChatMessage(sessionId, selectedId as number, {
        senderId: "instructor",
        senderName: "Formateur",
        text,
      });
    }
    isSendingRef.current = false;
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  const selectedTeamName =
    selectedId !== "broadcast"
      ? teams.find((t) => t.id === selectedId)?.name ?? ""
      : "";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ width: "840px", height: "600px", maxWidth: "95vw", maxHeight: "90vh" }}
      >
        {/* ── Barre latérale gauche ───────────────────────────────────────── */}
        <div className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <MessageCircle size={16} className="text-indigo-400" />
              Chat des équipes
              {totalUnread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {totalUnread}
                </span>
              )}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Broadcast */}
            <button
              onClick={() => setSelectedId("broadcast")}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                selectedId === "broadcast"
                  ? "bg-yellow-700/50 text-yellow-200"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Megaphone size={14} className="text-yellow-400" />
                <span className="text-sm font-medium">Broadcast</span>
              </div>
              {(unread["broadcast"] ?? 0) > 0 && (
                <span className="bg-yellow-500 text-gray-900 text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {unread["broadcast"]}
                </span>
              )}
            </button>

            {/* Liste des équipes */}
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedId(team.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  selectedId === team.id
                    ? "bg-indigo-700/50 text-indigo-200"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users size={13} className="text-indigo-400 shrink-0" />
                  <span className="text-sm truncate">{team.name}</span>
                </div>
                {(unread[team.id] ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shrink-0 ml-1">
                    {unread[team.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Panneau droit : messages ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              {selectedId === "broadcast" ? (
                <>
                  <Megaphone size={17} className="text-yellow-400" />
                  <span className="font-semibold text-white text-sm">
                    Message à toutes les équipes
                  </span>
                </>
              ) : (
                <>
                  <Users size={17} className="text-indigo-400" />
                  <span className="font-semibold text-white text-sm">
                    {selectedTeamName}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={21} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentMessages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-10">
                Aucun message pour le moment
              </p>
            ) : (
              currentMessages.map((msg, idx) => {
                const isInstructor = msg.senderId === "instructor";
                const isBroadcast = msg.type === "broadcast";

                if (isBroadcast) {
                  return (
                    <div
                      key={msg.id || idx}
                      className="flex justify-center"
                    >
                      <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-lg px-4 py-2 max-w-[85%]">
                        <div className="flex items-center gap-2 mb-1">
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
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex ${isInstructor ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col max-w-[70%] ${
                        isInstructor ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-xs text-gray-400 mb-0.5 mx-1">
                        {msg.senderName}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          isInstructor
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
          <div className="p-4 border-t border-gray-700 shrink-0">
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
                placeholder={
                  selectedId === "broadcast"
                    ? "Message à toutes les équipes..."
                    : `Message à ${selectedTeamName}...`
                }
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                maxLength={500}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {selectedId === "broadcast" ? (
                  <Megaphone size={15} />
                ) : (
                  <Send size={15} />
                )}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorChatPanel;
