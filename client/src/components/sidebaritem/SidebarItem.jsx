import styles from "./SidebarItem.module.css";


function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      className={`${styles.item} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      <Icon size={22} />
      <span>{label}</span>
    </button>
  );
}

export default SidebarItem;