import { useState } from "react";
import ParticipantRow from "../participantrow/ParticipantRow";
import styles from "./ParticipantList.module.css";

const RANK = { host: 0, moderator: 1, participant: 2 };

function ParticipantList({ participants, me, isHost, onAssignRole,  onTransferHost, onRemove }) {
  
  const [busyId, setBusyId] = useState(null);

  
  const sorted = [...participants].sort((a, b) => RANK[a.role] - RANK[b.role]);

  const run = async (userId, action) => {
    setBusyId(userId);
    await action();
    setBusyId(null);
  };

  const handleRemove = (p) => {
    if (window.confirm(`Remove ${p.username} from the room?`)) {
      run(p.userId, () => onRemove(p.userId));
    }
  };

  const handleMakeHost = (p) => {
    if (window.confirm(`Make ${p.username} the host? You will become a moderator.`)) {
      run(p.userId, () => onTransferHost(p.userId));
    }
  };

  return (
    <section>
      <h3 className={styles.title}>Participants ({participants.length})</h3>
      <ul className={styles.list}>
        {sorted.map((p) => (
          <ParticipantRow 
            key={p.userId}
            onMakeHost={()=> handleMakeHost(p)}
            participant={p}
            isMe={p.userId === me.userId}
            canManage={isHost && p.role !== "host"}
            busy={busyId === p.userId}
            onAssignRole={(role) => run(p.userId, () => onAssignRole(p.userId, role))}
            onRemove={() => handleRemove(p)}
          />
        ))}
      </ul>
    </section>
  );
}

export default ParticipantList;