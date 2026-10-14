import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function StoreLayout() {
  return (
    <>
      <Header />

      <main className="store-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default StoreLayout;
