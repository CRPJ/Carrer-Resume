import Banner from "@/components/home-career/Banner";
import Countdown from "@/components/home-career/Countdown";
import Feature from "@/components/home-career/Feature";
import LastStream from "@/components/home-career/LastStream";
import Platform from "@/components/home-career/Platform";
import Sidebar from "@/components/home-career/Sidebar";
import Streamer from "@/components/home-career/Streamer";
import TrendingNFT from "@/components/home-career/TrendingNFT";
import Cta from "@/components/home/Cta";
import Secure from "@/components/home/Secure";
import Animations from "@/components/shared/Animations";
const HomePageTwo = () => {
  return (
    <main className="nftg-content nftg-content-home">
      <Animations />
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <div className="home-two-content-col">
            <div className="home-two-content">
              {/* <!-- ==== banner section ==== --> */}
              <Banner />
              {/* <!-- ==== feature games section ==== --> */}
              <Feature />
              {/* <!-- ==== countdown section ==== --> */}
              <Countdown />
              {/* <!-- ==== trending nft section ==== --> */}
              <TrendingNFT />
              {/* <!-- ==== streamer section ==== --> */}
              <Streamer />
              {/* <!-- ==== platform section ==== --> */}
              <Platform />
              {/* <!-- ==== secure section ==== --> */}
              <Secure />
              {/* <!-- ==== last streams section ==== --> */}
              <LastStream />
            </div>
          </div>
        </div>
      </div>
      {/* <!-- ==== cta section ==== --> */}
      <Cta />
    </main>
  );
};

export default HomePageTwo;
