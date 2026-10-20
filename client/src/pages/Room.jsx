import { useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import RoomHeader from "../components/roomheader/RoomHeader";
import YouTubePlayer from "../components/youtubeplayer/YoutubePlayer";
import UrlInput from "../components/urlinput/UrlInput";
import ApprovalPanel from "../components/approvalpanel/ApprovalPanel";
import ParticipantList from "../components/participantlist/ParticipantList";
import Chat from "../components/chat/Chat";
import styles from "./Room.module.css";

function Room() {
  const { roomId: urlCode } = useParams();
  const {
    roomId, me, participants, videoState, messages, approvals, isHost, canControl,
    leaveRoom, assignRole, removeParticipant, transferHost, sendMessage, resolveRequest,
  } = useSocket();
  const navigate = useNavigate();

  // Remember if this user was ever inside the room during this visit
  const hadRoom = useRef(false);
  if (roomId) hadRoom.current = true;

  // Not in a room: opened a link directly, refreshed, was removed, or the connection dropped
  if (!roomId) {
    return (
      <Navigate
        to="/"
        replace
        state={hadRoom.current ? null : { joinCode: urlCode.toUpperCase() }}
      />
    );
  }

  const handleLeave = () => {
    navigate("/");
    leaveRoom();
  };

  return (
    <div className={styles.page}>
      <RoomHeader roomId={roomId} onLeave={handleLeave} />

      <div className={styles.layout}>
        <main className={styles.main}>
          {videoState ? (
            <YouTubePlayer />
          ) : (
            <div className={styles.loading}>Loading video...</div>
          )}

          {/* Everyone gets the input. For a participant it sends a REQUEST instead of changing the video. */}
          <UrlInput />
          {!canControl && (
            <p className={styles.hint}>
              Your play, pause, seek and video changes are sent to the host or a moderator for approval.
            </p>
          )}
        </main>

        <aside className={styles.side}>
          <ApprovalPanel approvals={approvals} canControl={canControl} onResolve={resolveRequest} />
          <div className={styles.card}>
            <ParticipantList
              participants={participants}
              me={me}
              isHost={isHost}
              onAssignRole={assignRole}
              onTransferHost={transferHost}
              onRemove={removeParticipant}
            />
          </div>
          <div className={styles.card}>
            <Chat messages={messages} meId={me.userId} onSend={sendMessage} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Room;