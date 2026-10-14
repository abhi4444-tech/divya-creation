import { useNavigate } from "react-router-dom";
import "../css/contact.css";


function ContactUs() {
    const navigate = useNavigate();
  return (
    <section className="contact-page">

    <button
        className="contact-back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="contact-heading">
        <span>GET IN TOUCH</span>
        <h1>Contact Us</h1>
        <p>We’d love to hear from you.</p>
      </div>
      
      <div className="contact-box">

        <div className="contact-info">
          <h2>Let's Talk</h2>
          <p>
            Have a question about our products or your order?
            Send us a message and we’ll get back to you.
          </p>

          <div>📞 +91 98765 43210</div>
          <div>✉️ support@divyacreation.com</div>
          <div>📍 Mumbai, Maharashtra</div>
        </div>

        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <input type="text" placeholder="Subject" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>

      </div>

    </section>
  );
}

export default ContactUs;
