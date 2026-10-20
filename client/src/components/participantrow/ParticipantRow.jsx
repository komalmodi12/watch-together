import { Crown, Shield, UserMinus } from "lucide-react";
import Avatar from "../avatar/Avatar";
import styles from "./ParticipantRow.module.css";

const ROLE_LABEL = { host: "Host", moderator: "Moderator", participant: "Participant" };

// Only shows data and calls the functions it is given. It knows nothing about sockets.
function ParticipantRow({ participant, isMe, canManage, busy, onAssignRole, onMakeHost, onRemove }) {
  const { username, role } = participant;

  return (
    <li className={styles.row}>
      <Avatar letter={username[0]?.toUpperCase()} size={32} />

      <div className={styles.info}>
        <span className={styles.name}>
          {username}
          {isMe && " (you)"}
        </span>
        <span className={`${styles.badge} ${styles[role]}`}>
          {role === "host" && <Crown size={12} />}
          {role === "moderator" && <Shield size={12} />}
          {ROLE_LABEL[role]}
        </span>
      </div>

    
      {canManage && (
        <div className={styles.actions}>
          <select
            className={styles.select}
            value={role} /* controlled: the list comes from the server, so it always shows the real role */
            disabled={busy}
            onChange={(e) => onAssignRole(e.target.value)}
            aria-label={`Role of ${username}`}
          >
            <option value="participant">Participant</option>
            <option value="moderator">Moderator</option>
          </select>

                    <button
            className={styles.makeHost}
            onClick={onMakeHost}
            disabled={busy}
            title={`Make ${username} the host`}
            aria-label={`Make ${username} the host`}
          >
            <Crown size={16} />
          </button>
          
          <button
            className={styles.remove}
            onClick={onRemove}
            disabled={busy}
            title={`Remove ${username}`}
            aria-label={`Remove ${username}`}
          >
            <UserMinus size={16} />
          </button>
        </div>
      )}
    </li>
  );
}

export default ParticipantRow;