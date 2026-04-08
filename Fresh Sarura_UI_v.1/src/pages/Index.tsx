import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProduceSection from "@/components/ProduceSection";
import BuyersSection from "@/components/BuyersSection";
import OutgrowersSection from "@/components/OutgrowersSection";
import ApproachSection from "@/components/ApproachSection";
import WhySection from "@/components/WhySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <WhySection />
    <ProduceSection />
    <BuyersSection />
    <OutgrowersSection />
    <ApproachSection />
    <ContactSection />
    <Footer />
  </div>
);

export default Index;
