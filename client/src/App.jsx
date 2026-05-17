import Navbar from "./component/Navbar";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import Footer from "./component/Footer";




function App() {
  return (
    <>
    <Navbar />
       <ScrollToTop /> 
      {/* Page content will show here */}
      <div className="mt-4 px-6">
        <Outlet />
      </div>
         <Footer />
         
    </>
    
  );
}

export default App;