import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { io } from "socket.io-client";
import { describeRequest } from "../utils/requests";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";


const socket = io(SERVER_URL, { autoConnect: false });

const SocketContext = createContext(null); 
export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [identity, setIdentity] = useState(null);   
  const [participants, setParticipants] = useState([]);
  const [videoState, setVideoState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [approvals, setApprovals] = useState([]);

  const [notice, setNotice] = useState(null);       
  const identityRef = useRef(null);
 
  const roleRef = useRef(null);

  const showNotice = useCallback((text) => setNotice({ id: Date.now(), text }), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const resetRoom = useCallback(() => {
    identityRef.current = null;
    roleRef.current = null;
    setRoomId(null);
    setIdentity(null);
    setParticipants([]);
    setVideoState(null);
    setMessages([]); 
    setApprovals([]);
  }, []);

  
  useEffect(() => {
    const onConnect = () => setConnected(true);

    const onDisconnect = (reason) => {
      setConnected(false);
     
      if (identityRef.current && reason !== "io client disconnect") {
        resetRoom();
        showNotice("Connection lost. Please rejoin the room.");
      }
    };

    
    const onParticipants = (data) => setParticipants(data.participants);

      
    const onRoleAssigned = (data) => {
      setParticipants(data.participants);

      const mine = data.participants.find((p) => p.userId === identityRef.current?.userId);
      if (!mine || mine.role === roleRef.current) return; 

      const before = roleRef.current;
      roleRef.current = mine.role;

      if (mine.role === "host") showNotice("You are now the host");
      else if (before === "host") showNotice(`You are no longer the host. You are now a ${mine.role}`);
      else if (mine.role === "moderator") showNotice("You are now a moderator");
      else showNotice("You are now a participant");
    };

    const onRemoved = (data) => {
      if (data.userId === identityRef.current?.userId) {
        resetRoom(); 
        showNotice("You were removed from the room by the host");
      } else {
        setParticipants(data.participants);
      }
    };

    
    const onSync = (data) => setVideoState({ ...data, receivedAt: Date.now() });

    const onError = (data) => showNotice(data.message); 
    const onChatMessage = (msg) => setMessages((prev) => [...prev, msg].slice(-200));
    const onChatHistory = (history) => setMessages(Array.isArray(history) ? history : [])
     const onApprovals = (list) => setApprovals(Array.isArray(list) ? list : []);

    const onRequestResult = (d) => {
      const verdict = d.approved ? "approved" : "rejected";
      showNotice(`${d.by} ${verdict} your request to ${describeRequest(d)}`);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user_joined", onParticipants);
    socket.on("user_left", onParticipants);
    socket.on("role_assigned", onRoleAssigned);
    socket.on("participant_removed", onRemoved);
    socket.on("sync_state", onSync);
    socket.on("error_message", onError);
    socket.on("chat_message", onChatMessage);
    socket.on("chat_history", onChatHistory);
     socket.on("approval_requests", onApprovals);
    socket.on("request_result", onRequestResult);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user_joined", onParticipants);
      socket.off("user_left", onParticipants);
      socket.off("role_assigned", onRoleAssigned);
      socket.off("participant_removed", onRemoved);
      socket.off("sync_state", onSync);
      socket.off("error_message", onError);
      socket.disconnect();
      socket.off("chat_message", onChatMessage);
      socket.off("chat_history", onChatHistory);
      socket.off("approval_requests", onApprovals);
      socket.off("request_result", onRequestResult);
    };
  }, [resetRoom, showNotice]);

  
  const request = useCallback(
    (event, payload) =>
      new Promise((resolve) => {
        if (!socket.connected) {
          return resolve({ ok: false, message: "Not connected to the server" });
        }
        
        socket.timeout(5000).emit(event, payload, (err, res) => {
          resolve(err ? { ok: false, message: "Server not responding. Try again." } : res);
        });
      }),
    []
  );

  const enterRoom = useCallback((res, username) => {
    const who = { userId: res.userId, username };
    identityRef.current = who;
    roleRef.current = res.role; 
    setIdentity(who);
    setRoomId(res.roomId);
    setParticipants(res.participants);
  }, []);

  const createRoom = useCallback(
    async (username) => {
      const res = await request("create_room", { username });
      if (res.ok) enterRoom(res, username);
      return res; 
    },
    [request, enterRoom]
  );

  const joinRoom = useCallback(
    async (code, username) => {
      const res = await request("join_room", { roomId: code, username });
      if (res.ok) enterRoom(res, username);
      return res;
    },
    [request, enterRoom]
  );

  const leaveRoom = useCallback(() => {
    socket.emit("leave_room");
    resetRoom();
  }, [resetRoom]);

   
  const changeVideo = useCallback(
    (videoId) => request("change_video", { videoId }),
    [request]
  );

   
  const play = useCallback((currentTime) => request("play", { currentTime }), [request]);
  const pause = useCallback((currentTime) => request("pause", { currentTime }), [request]);


  const seek = useCallback((time) => request("seek", { time }), [request]);

   const assignRole = useCallback(
    async (userId, role) => {
      const res = await request("assign_role", { userId, role });
      if (!res.ok) showNotice(res.message);
      return res;
    },
    [request, showNotice]
  );

  const removeParticipant = useCallback(
    async (userId) => {
      const res = await request("remove_participant", { userId });
      if (!res.ok) showNotice(res.message);
      return res;
    },
    [request, showNotice]
  );

   const transferHost = useCallback(
    async (userId) => {
      const res = await request("transfer_host", { userId });
      if (!res.ok) showNotice(res.message);
      return res;
    },
    [request, showNotice]
  );

    const sendMessage = useCallback(
    async (text) => {
      const res = await request("chat_message", { text });
      if (!res.ok) showNotice(res.message); // e.g. "You are sending messages too fast"
      return res;
    },
    [request, showNotice]
  );

     const requestAction = useCallback(
    async (payload) => {
      const res = await request("request_action", payload);
      showNotice(res.ok ? "Request sent. The host or a moderator will review it." : res.message);
      return res;
    },
    [request, showNotice]
  );

  // Host / Moderator only
  const resolveRequest = useCallback(
    async (requestId, approve) => {
      const res = await request("resolve_request", { requestId, approve });
      if (!res.ok) showNotice(res.message);
      return res;
    },
    [request, showNotice]
  );
  
  const me = useMemo(() => {
    if (!identity) return null;
    const mine = participants.find((p) => p.userId === identity.userId);
    return { ...identity, role: mine?.role ?? "participant" };
  }, [identity, participants]);

  
  const isHost = me?.role === "host";
  const canControl = me?.role === "host" || me?.role === "moderator";

  const value = {
    socket, connected, roomId, me, participants, videoState, messages, approvals, notice,
    isHost, canControl,
    createRoom, joinRoom, leaveRoom, changeVideo, play, pause, seek, assignRole, removeParticipant, transferHost, sendMessage, requestAction, resolveRequest, clearNotice,
  };

  
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}


export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
}