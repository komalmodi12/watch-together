import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import styles from "./HeroBanner.module.css";
import Button from "../button/Button";
import IconButton from "../iconbutton/IconButton";

function HeroBanner({ onCreate }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null; 

  return (
    <section className={styles.hero}>
      <div className={styles.close}>
        <IconButton label="Close" onClick={() => setVisible(false)}>
          <X size={20} />
        </IconButton>
      </div>

      <h2 className={styles.title}>WatchTogether</h2>
      <p className={styles.sub}>Watch YouTube Together, in Real-Time!</p>

      <div>
        <Button variant="light" icon={<ArrowRight size={18} />} onClick={onCreate}>
          Create a Watch Party
        </Button>
      </div>
    </section>
  );
}

export default HeroBanner;