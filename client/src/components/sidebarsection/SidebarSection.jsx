import styles from "./SidebarSection.module.css";
import SidebarItem from "../sidebaritem/SidebarItem";

function SidebarSection({ title, items, activeId, onItemClick }) {
  return (
    <section className={styles.section}>
      {title && <h3 className={styles.title}>{title}</h3>}

      {items.map((item) => (
        <SidebarItem
          key={item.id}              
          icon={item.icon}
          label={item.label}
          active={activeId === item.id}
          onClick={() => onItemClick(item)}
        />
      ))}
    </section>
  );
}

export default SidebarSection;