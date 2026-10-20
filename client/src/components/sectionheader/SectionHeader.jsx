import { ArrowRight } from "lucide-react";
import styles from "./SectionHeader.module.css";

function SectionHeader({ title, icon }) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>
        {icon}
        {title}
      </h2>
      <button className={styles.viewAll}>
        View all <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default SectionHeader;