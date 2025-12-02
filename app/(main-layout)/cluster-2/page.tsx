import ClusterTabs from "@/components/home-career/ClusterTabs";
import Sidebar from "@/components/home-career/Sidebar";
import Cluster2Content from "@/components/cluster-2/Cluster2Content";
import Animations from "@/components/shared/Animations";

const Cluster2Page = () => {
  return (
    <main className="nftg-content nftg-content-home">
      <Animations />
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <div className="home-two-content-col">
            <ClusterTabs />
            <div className="home-two-content">
              <Cluster2Content />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cluster2Page;
