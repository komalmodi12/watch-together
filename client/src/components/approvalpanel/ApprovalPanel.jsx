import { useState } from "react";
import ApprovalItem from "../approvalitem/ApprovalItem";
import styles from "./ApprovalPanel.module.css";

function ApprovalPanel({ approvals, canControl, onResolve }) {
  const [busyId, setBusyId] = useState(null); // the request waiting for the server, so no double click

  if (approvals.length === 0) return null; // nothing pending: no card at all

  const resolve = async (id, approve) => {
    setBusyId(id);
    await onResolve(id, approve);
    setBusyId(null);
  };

  return (
    <section className={styles.panel}>
      {/* A controller sees everyone's requests. A participant only ever receives their own. */}
      <h3 className={styles.title}>
        {canControl ? `Requests (${approvals.length})` : "Your request"}
      </h3>
      <ul className={styles.list}>
        {approvals.map((r) => (
          <ApprovalItem
            key={r.id}
            request={r}
            canResolve={canControl}
            busy={busyId === r.id}
            onApprove={() => resolve(r.id, true)}
            onReject={() => resolve(r.id, false)}
          />
        ))}
      </ul>
    </section>
  );
}

export default ApprovalPanel;