import {useState} from 'react';
import {useLocation} from 'react-router-dom';
import styles from "./Home.module.css";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import MainFeed from "../components/mainfeed/MainFeed";
import RightPanel from "../components/rightpanel/RightPanel";
import CreateRoomModal from "../components/createroommodal/CreateRoomModal";
import JoinRoomModal from "../components/joinroommodal/JoinRoomModal";


function Home() {

  const location = useLocation();

const [modal, setModal] = useState(null);
const [joinCode, setJoinCode] = useState(
  location.state?.joinCode || ""
);

  const openCreate = () => setModal("create");

 
  const openJoin = (code) => {
    setJoinCode(typeof code === "string" ? code : "");
    setModal("join");
  };

  
  const closeModal = () => setModal(null);

  return (
    <>
      <header className={styles.navbar}>
        <Navbar onCreateRoom={openCreate} />
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <Sidebar onCreate={openCreate} onJoin={openJoin} />
        </aside>
        <main className={styles.main}>
          <MainFeed onCreate={openCreate} />
        </main>
        <aside className={styles.right}>
          <RightPanel onCreate={openCreate} onJoin={openJoin} />
        </aside>
      </div>

      {/* Mounted only while open, so each open starts with a fresh form */}
      {modal === "create" && <CreateRoomModal onClose={closeModal} />}
      {modal === "join" && <JoinRoomModal onClose={closeModal} initialCode={joinCode} />}
    </>
  );
}

export default Home;