import { Flame } from "lucide-react";
import styles from "./TrendingList.module.css";
import TrendingItem from "../trendingitem/TrendingItem";
import useTrending from "../../hooks/useTrending";

function TrendingList() {
  const { trending } = useTrending();

  return (
    <section className={styles.card}>
      <h3 className={styles.title}>
        <Flame size={24} color="#f97316" fill="#f97316" /> Trending Now
      </h3>
      {trending.map((t) => (
        <TrendingItem key={t.id} item={t} />
      ))}
    </section>
  );
}

export default TrendingList;