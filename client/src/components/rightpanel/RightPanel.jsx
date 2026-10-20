import styles from "./RightPanel.module.css";
import WatchPartyCard from "../watchpartycard/WatchPartyCard";
import ActiveRooms from "../activerooms/ActiveRooms";
import TrendingList from "../trendinglist/TrendingList";
import PromoCard from "../promocard/PromoCard";


function RightPanel({ onCreate, onJoin }) {
  return (
    <div className={styles.panel}>
      <WatchPartyCard onCreate={onCreate} onJoin={onJoin} />
      <ActiveRooms onJoin={onJoin} />
      <TrendingList />
      <PromoCard />
    </div>
  );
}

export default RightPanel;