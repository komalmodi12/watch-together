import { Zap } from "lucide-react";
import styles from "./MainFeed.module.css";
import CategoryChips from "../categorychips/CategoryChips";
import HeroBanner from "../herobanner/HeroBanner";
import SectionHeader from "../sectionheader/SectionHeader";
import ShortsRow from "../shortsrow/ShortsRow";
import VideoCard from "../videocard/VideoCard";
import { videos } from "../../data/mockData";


function MainFeed({ onCreate }) {
  return (
    <div className={styles.feed}>
      <CategoryChips />
      <HeroBanner onCreate={onCreate} />
      <SectionHeader title="Shorts" icon={<Zap size={26} color="#ff0033" fill="#ff0033" />} />
      <ShortsRow />
      <div className={styles.videos}>
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

export default MainFeed;