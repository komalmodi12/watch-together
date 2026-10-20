import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

function Modal({ title, onClose, children }) {
  // Close on Escape key. Cleanup removes the listener when the modal unmounts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    
    <div className={styles.backdrop} onClick={onClose}>
      
      <div
        className={styles.box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;