import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import styles from "./Toast.module.css";

function Toast() {
  const { notice, clearNotice } = useSocket();

  
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(clearNotice, 4000);
    return () => clearTimeout(timer);
  }, [notice, clearNotice]);

  if (!notice) return null;

  return (
    <div className={styles.toast} role="alert">
      {notice.text}
    </div>
  );
}

export default Toast;