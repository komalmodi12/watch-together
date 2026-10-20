import { Check, X, ExternalLink } from "lucide-react";
import { describeRequest } from "../../utils/requests";
import styles from "./ApprovalItem.module.css";

// Only shows data and calls the functions it is given, like ParticipantRow
function ApprovalItem({ request, canResolve, busy, onApprove, onReject }) {
  const what = describeRequest(request);

  return (
    <li className={styles.item}>
      <div className={styles.text}>
        <span>
          {canResolve ? (
            <>
              <strong>{request.username}</strong> wants to {what}
            </>
          ) : (
            <>You asked to {what}</>
          )}
        </span>

        {/* The host can look at the video before deciding. videoId was checked by the server (11 safe characters). */}
        {request.type === "change_video" && (
          <a
            className={styles.preview}
            href={`https://www.youtube.com/watch?v=${request.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview <ExternalLink size={12} />
          </a>
        )}
      </div>

      {canResolve ? (
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.approve}`}
            onClick={onApprove}
            disabled={busy}
            title="Approve"
            aria-label="Approve"
          >
            <Check size={16} />
          </button>
          <button
            className={`${styles.btn} ${styles.reject}`}
            onClick={onReject}
            disabled={busy}
            title="Reject"
            aria-label="Reject"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <span className={styles.waiting}>Waiting...</span>
      )}
    </li>
  );
}

export default ApprovalItem;