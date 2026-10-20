import { Menu, Mic, Bell, Plus } from "lucide-react";
import styles from "./Navbar.module.css";
import Logo from "../logo/Logo";
import SearchBar from "../searchbar/SearchBar";
import IconButton from "../iconbutton/IconButton";
import Button from "../button/Button";
import Avatar from "../avatar/Avatar";

function Navbar({ onCreateRoom }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <IconButton label="Menu">
          <Menu size={22} />
        </IconButton>
        <Logo />
      </div>

      <div className={styles.center}>
        <SearchBar />
        <IconButton label="Search with voice">
          <Mic size={20} />
        </IconButton>
      </div>

      <div className={styles.right}>
        <span className={styles.createBtn}>
          <Button variant="danger" icon={<Plus size={16} />} onClick={onCreateRoom}>
            Create Room
          </Button>
        </span>
        <IconButton label="Notifications">
          <Bell size={20} />
        </IconButton>
        <Avatar letter="N" />
      </div>
    </nav>
  );
}

export default Navbar;