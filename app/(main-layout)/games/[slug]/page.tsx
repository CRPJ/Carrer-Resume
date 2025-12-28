import Details from "@/components/games/Details";
import Cta from "@/components/home/Cta";
import Animations from "@/components/shared/Animations";
import Breadcrumb from "@/components/shared/Breadcrumb";
import games from "@/public/data/games";
export async function generateStaticParams() {
  return games.map((game) => ({
    slug: game.id.toString(),
  }));
}
const GameDetailsPage = ({ params }: { params: { slug: string } }) => {
  const game = games.find((game) => game.id.toString() === params.slug);
  return (
    <main className="nftg-content">
      <Animations />
      <Breadcrumb title="Game Details" />
      <Details game={game!} />
      <Cta />
    </main>
  );
};

export default GameDetailsPage;
