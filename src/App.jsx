import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useState, useEffect } from "react";

const categories = [
  "Birthday Gifts",
  "Anniversary Gifts",
  "Personalized Gifts",
  "Photo Frames",
  "Handmade Crafts",
  "Home Decor",
  "Jewellery",
  "Greeting Cards",
];

import Home from "./pages/Home";
import BestSeller from "./pages/BestSeller";
import ProductDetails from "./pages/ProductDetails";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import Wishlist from "./pages/Wishlist";
import Shop from "./pages/Shop";
import NewArrivals from "./pages/NewArrivals";
import MyOrders from "./pages/MyOrders";
import SavedAddresses from "./pages/SavedAddresses";


import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import AdminOrders from "./pages/AdminOrders";
import OrderDetails from "./pages/OrderDetails";
import CustomizeBanner from "./pages/CustomizeBanner";
import Profile from "./pages/Profile";
import ContactUs from "./pages/ContactUs";
import Categories from "./pages/Categories";
import ManageCategories from "./pages/ManageCategories";



import Login from "./pages/Login";
import Register from "./pages/Register";
import Footer from "./components/Footer";
import AdminProducts from "./pages/AdminProducts";
import SearchResults from "./pages/SearchResults";




import StoreLayout from "./components/StoreLayout";

import "./css/global.css";
import "./App.css";



function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  const [showCategories, setShowCategories] = useState(false);
  return (
    <>
    
    <BrowserRouter>
    <ScrollToTop />
    <Routes>
    <Route path="/profile" element={<Profile />} />

  {/* ================= STORE PAGES ================= */}

  <Route element={<StoreLayout />}>

    <Route
      path="/"
      element={<Home />}
    />

    <Route
      path="/best-sellers"
      element={<BestSeller />}
    />
    <Route
    path="/contact"
    element={<ContactUs />}
  />
     <Route path="/shop" element={<Shop />} />
     <Route path="/new-arrivals" element={<NewArrivals />}/>

    <Route
      path="/product/:id"
      element={<ProductDetails />}

    />
    <Route
  path="/saved-addresses"
  element={<SavedAddresses />}
/>


    <Route
    path="/search"
    element={<SearchResults />}
    />

  </Route>


  {/* ================= USER ================= */}

  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />

  {/* ================= SHOPPING ================= */}

  <Route
    path="/cart"
    element={<Cart />}
  />

  <Route
    path="/checkout"
    element={<Checkout />}
  />
  <Route
    path="/payment"
    element={<Payment />}
  />

  <Route
    path="/order-success"
    element={<OrderSuccess />}
  />
   <Route
    path="/my-orders"
    element={<MyOrders />}
  />


  {/* ================= ADMIN ================= */}

  <Route
  path="/admin/categories"
  element={<ManageCategories />}
/>

  <Route
    path="/admin"
    element={<AdminLogin />}
  />

  <Route
    path="/admin/dashboard"
    element={<AdminDashboard />}
  />

  <Route
  path="/admin/products"
  element={<AdminProducts />}
  />

  <Route
    path="/admin/add-product"
    element={<AddProduct />}
  />

  <Route
    path="/admin/orders"
    element={<AdminOrders />}
  />
  <Route
    path="/admin/orders/:id"
    element={<OrderDetails />}
  />
  <Route
  path="/admin/customize-banner"
  element={<CustomizeBanner />}
  />
  
  <Route
  path="/categories"
  element={<Categories />}
  />
  <Route
  path="/wishlist"
  element={<Wishlist />}
  />

</Routes>
</BrowserRouter>
</>
  );
}

export default App;
