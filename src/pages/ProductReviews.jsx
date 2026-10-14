import { useState } from "react";

export default function ProductReviews() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const reviews = [
    {
      name: "Rahul",
      rating: 5,
      comment: "Product ki quality bahut achhi hai.",
      verified: true,
    },
    {
      name: "Amit",
      rating: 4,
      comment: "Overall product achha hai.",
      verified: true,
    },
  ];

  return (
    <div className="reviews-container">

      <h2>Ratings & Reviews</h2>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="average-rating">
          <span>4.3</span> ⭐
          <p>1,248 Ratings</p>
        </div>

        <div className="rating-bars">
          <div>5 ⭐ <progress value="80" max="100" /></div>
          <div>4 ⭐ <progress value="65" max="100" /></div>
          <div>3 ⭐ <progress value="40" max="100" /></div>
          <div>2 ⭐ <progress value="20" max="100" /></div>
          <div>1 ⭐ <progress value="10" max="100" /></div>
        </div>
      </div>

      <hr />

      {/* Write Review */}
      <div className="write-review">
        <h3>Write a Review</h3>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? "selected" : ""}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <button>Submit Review</button>
      </div>

      <hr />

      {/* Reviews */}
      <div className="review-list">
        {reviews.map((item, index) => (
          <div className="review" key={index}>

            <div className="review-stars">
              {"★".repeat(item.rating)}
              {"☆".repeat(5 - item.rating)}
            </div>

            <p>{item.comment}</p>

            <small>
              {item.name} •{" "}
              {item.verified && (
                <span className="verified">
                  ✓ Verified Purchase
                </span>
              )}
            </small>

          </div>
        ))}
      </div>

    </div>
  );
}
