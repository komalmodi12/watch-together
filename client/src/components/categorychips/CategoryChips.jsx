import { useState } from "react";
import styles from "./CategoryChips.module.css";
import Chip from "../chip/Chip";
import { categories } from "../../data/mockData";

function CategoryChips() {
  const [active, setActive] = useState("All");

  return (
    <div className={styles.row}>
      {categories.map((c) => (
        <Chip key={c} label={c} active={active === c} onClick={() => setActive(c)} />
      ))}
    </div>
  );
}

export default CategoryChips;