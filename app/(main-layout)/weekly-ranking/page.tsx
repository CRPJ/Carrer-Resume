import Cta from "@/components/home/Cta";
import WeeklyRankingContent from "@/components/weekly-ranking/WeeklyRankingContent";
import Animations from "@/components/shared/Animations";
import Breadcrumb from "@/components/shared/Breadcrumb";

const page = () => {
  return (
    <main className="nftg-content">
      <Animations />
      <Breadcrumb title="주간 랭킹" />
      <WeeklyRankingContent />
      <Cta />
    </main>
  );
};

export default page;
