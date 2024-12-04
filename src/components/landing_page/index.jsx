import Header from "./header/Header";
import Review from "./review/review";
import ThreeBlock from "./threeBlock/ThreeBlock";
import Feature from "./feature/Feature";
import FeatureGreen from "./feature/FeatureGreen";
import PriceTable from "./priceTable/PriceTable";
import Contact from "./contact/Contact";
import Footer from "../shared/footer/Footer";

const index = () => {
  return (
    <>
      <Header />
      <Review />
      <Feature />
      <FeatureGreen />
      <ThreeBlock />
      <PriceTable />
      <Contact />
      <Footer />
    </>
  );
};

export default index;
