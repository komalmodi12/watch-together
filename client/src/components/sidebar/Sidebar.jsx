import { useState } from "react";
import SidebarSection from "../sidebarsection/SidebarSection";
import { sidebarSections } from "../../data/mockData";

function Sidebar({ onCreate, onJoin }) {
  const [activeId, setActiveId] = useState("home"); 

  const handleItemClick = (item) => {
  
    if (item.action === "create") return onCreate?.();
    if (item.action === "join") return onJoin?.();
    setActiveId(item.id);
  };

  return (
    <nav>
      {sidebarSections.map((section) => (
        <SidebarSection
          key={section.id}
          title={section.title}
          items={section.items}
          activeId={activeId}
          onItemClick={handleItemClick}
        />
      ))}
    </nav>
  );
}

export default Sidebar;