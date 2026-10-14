import React from "react";
import "../css/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* About */}
        <div className="footer-section">
          <h2>Divya Creation 💗</h2>
          <p>
            Beautiful gifts made with love for your special moments.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/shop">Shop</a>
          <a href="/best-sellers">Best Sellers</a>
          <a href="/new-arrivals">New Arrivals</a>
        </div>

        {/* Customer Support */}
        <div className="footer-section">
          <h3>Customer Support</h3>
          <a href="/contact">Contact Us</a>
          <a href="/orders">My Orders</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Get In Touch</h3>
          <p>📧 divyacreation@gmail.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 India</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Divya Creation. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
