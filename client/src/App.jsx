import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import ScrollToTop from "./ScrollToTop";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />

      {/*
        Issue 01 Fix: Global Container
        - max-width: 1280px — wide screen e content center thakbe
        - margin: 0 auto   — auto margin e center hobe
        - min-height ensures footer stays at bottom (Issue 02)
        - px-4 = horizontal padding for small screens
      */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
          minHeight: "calc(100vh - 130px)", // Issue 02: footer floating fix
        }}
      >
        <Outlet />
      </div>

      <Footer />
    </>
  );
}

export default App;