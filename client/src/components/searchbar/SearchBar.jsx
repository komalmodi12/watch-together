import { useState } from "react";
import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className={styles.bar}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search YouTube videos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className={styles.btn} aria-label="Search">
        <Search size={20} />
      </button>
    </div>
  );
}

export default SearchBar;