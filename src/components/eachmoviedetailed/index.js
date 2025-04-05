import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './index.css';

const Eachmoviedetails = () => {
    const { id } = useParams(); // Get movie ID from URL
    const navigate = useNavigate(); // For navigation
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch movie details when the component loads
    useEffect(() => {
        const getMovieDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5002/movie/${id}`, {
                    method: 'GET',
                    credentials: 'include'
                });
               
                const data = await response.json();
                console.log("Fetched Movie Data:", data);
                if (response.ok) {
                    setMovie(data.data.movie);
                }
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        getMovieDetails();
    }, [id]);

    // Fetch reviews for the movie
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5002/review/${id}`, { credentials: 'include' });
            if (response.status === 401) {
                navigate('/login'); // Redirect if not logged in
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle review form toggle
    const handleReviewButtonClick = async () => {
        if (!showReviewForm) {
            await fetchReviews();
        }
        setShowReviewForm(prev => !prev);
    };

    // Submit a new review
    const submitReview = async () => {
        if (!reviewContent || !reviewRating) {
            alert('Please enter both review content and rating');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5002/review/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: reviewContent, rating: reviewRating })
            });

            if (response.status === 401) {
                navigate('/login'); // Redirect if not logged in
                return;
            }
            if (!response.ok) {
                alert('Failed to add review');
                return;
            }

            setReviewContent('');
            setReviewRating('');
            fetchReviews(); // Refresh review list
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle Like with optimistic update
    const toggleLike = async () => {
        // Update state immediately for better UX
        setMovie(prevMovie => {
            if (!prevMovie) return null;
            return { ...prevMovie, isliked: !prevMovie.isliked };
        });

        try {
            const response = await fetch(`http://localhost:5002/movie/toggle-like/${id}`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (response.status === 401) {
                // Revert optimistic update on authentication error
                setMovie(prevMovie => {
                    if (!prevMovie) return null;
                    return { ...prevMovie, isliked: !prevMovie.isliked };
                });
                navigate('/login'); // Redirect if not logged in
                return;
            }
            if (!response.ok) {
                // Revert optimistic update on other errors
                setMovie(prevMovie => {
                    if (!prevMovie) return null;
                    return { ...prevMovie, isliked: !prevMovie.isliked };
                });
                throw new Error('Failed to toggle like');
            }

            // Only log the result, state is already updated optimistically
            const result = await response.json();
            console.log("Updated Like Data:", result);
           
            // For the first fetch only, sync with server state to ensure consistency
            if (result.isliked !== undefined && movie.isliked !== result.isliked) {
                setMovie(prevMovie => {
                    if (!prevMovie) return null;
                    return { ...prevMovie, isliked: result.isliked };
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Toggle Watchlist with optimistic update
    const toggleWatchlist = async () => {
        // Update state immediately for better UX
        setMovie(prevMovie => {
            if (!prevMovie) return null;
            return { ...prevMovie, isWatchlisted: !prevMovie.isWatchlisted };
        });

        try {
            const response = await fetch(`http://localhost:5002/movie/toggle-watchlist/${id}`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (response.status === 401) {
                // Revert optimistic update on authentication error
                setMovie(prevMovie => {
                    if (!prevMovie) return null;
                    return { ...prevMovie, isWatchlisted: !prevMovie.isWatchlisted };
                });
                navigate('/login'); // Redirect if not logged in
                return;
            }
            if (!response.ok) {
                // Revert optimistic update on other errors
                setMovie(prevMovie => {
                    if (!prevMovie) return null;
                    return { ...prevMovie, isWatchlisted: !prevMovie.isWatchlisted };
                });
                throw new Error('Failed to toggle watchlist');
            }
           
            // Only log the result, state is already updated optimistically
            const result = await response.json();
            console.log("Updated Watchlist Data:", result);
           
            // For the first fetch only, sync with server state to ensure consistency
            if (result.isWatchlisted !== undefined && movie.isWatchlisted !== result.isWatchlisted) {
                setMovie(prevMovie => {
                    if (!prevMovie) return null;
                    return { ...prevMovie, isWatchlisted: result.isWatchlisted };
                });
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        }
    };

    if (!movie) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="movie-detail-container">
            <div className="theme-banner" style={{ backgroundImage: `url(${movie.themeimageUrl})` }}></div>
            <div className="movie-content">
                <div className="poster-container">
                    <img src={movie.posterimageUrl} alt={movie.title} className="poster-image" />
                </div>
                <div className="movie-info">
                    <h2>{movie.title}</h2>
                    <p><strong>⭐ {movie.average_rating}</strong> • {movie.release_year} • {movie.runtime} min</p>
                    <p>{movie.country} • {movie.language}</p>
                    <p><strong>Genres:</strong> {movie.genres.map(g => g.name).join(", ")}</p>
                    <p className="synopsis">{movie.synopsis}</p>
                   
                    <h3>Cast & Crew</h3>
                    <ul className="cast-list">
                        {movie.castCrew.map((person, index) => (
                            <li key={index}>{person.name} - {person.role}</li>
                        ))}
                    </ul>

                    <div className="actions">
                        <button className={`like-btn ${movie.isliked ? "liked" : ""}`} onClick={toggleLike}>
                            {movie.isliked ? "❤ Liked" : "🤍 Like"}
                        </button>
                        <button className={`watchlist-btn ${movie.isWatchlisted ? "watchlisted" : ""}`} onClick={toggleWatchlist}>
                            {movie.isWatchlisted ? "✔ Watchlisted" : "➕ Watchlist"}
                        </button>
                    </div>

                    <button className="review-btn" onClick={handleReviewButtonClick}>
                        {showReviewForm ? "Hide Reviews" : "Reviews & Ratings"}
                    </button>

                    {showReviewForm && (
                        <div className="review-section">
                            <h3>User Reviews</h3>
                            {isLoading ? (
                                <div className="review-loader">Loading reviews...</div>
                            ) : (
                                <div className="reviews-list">
                                    {reviews.length > 0 ? (
                                        <ul className="review-items">
                                            {reviews.map((review) => (
                                                <li key={review.id} className="review-item">
                                                    <div className="review-header">
                                                        <span className="review-username">{review.user.username}</span>
                                                        <span className="review-rating">⭐ {review.rating}/10</span>
                                                    </div>
                                                    <p className="review-content">{review.content}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-reviews">No reviews yet. Be the first to share your thoughts!</p>
                                    )}
                                </div>
                            )}

                            <div className="add-review-form">
                                <h4>Add Your Review</h4>
                                <textarea
                                    placeholder="Share your thoughts..."
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                ></textarea>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="Rating (1-10)"
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(e.target.value)}
                                />
                                <button onClick={submitReview} disabled={isLoading}>
                                    {isLoading ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Eachmoviedetails;