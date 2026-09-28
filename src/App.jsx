import Header from "./components/Header";
import BuildYourMix from "./components/BuildYourMix";
import HowYoudInvest from "./components/HowYoudInvest";
import MixVsBenchmark from "./components/MixVsBenchmark";
import EachFundOnItsOwn from "./components/EachFundOnItsOwn";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <>
      <Header />
      <main>
        <form className="col">
          <BuildYourMix />
          <HowYoudInvest />
        </form>
        <div className="col">
          <MixVsBenchmark />
          <EachFundOnItsOwn />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App