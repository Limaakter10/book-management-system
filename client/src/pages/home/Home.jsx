import Navbar from "../../component/Navbar";
import Hero from "../../component/Hero";
import HomeSection from "../../component/HomeSection";
import Footer from "../../component/Footer";
import Advertisement from "../../component/Advertisement";
import BlogSection from "../../component/BlogSection";



const Home = () => {
  return (
    <>
   {/* <Navbar /> */}
      <Hero />        {/* 👈 ADD THIS */}
      <HomeSection />
      {/* // 🔽 ADD HERE (Advertisement) */}
<Advertisement />

{/* // 🔽 ADD HERE (Blog) */}
<BlogSection />
        {/* <Footer /> */}
    
    </>
  );
};

export default Home;