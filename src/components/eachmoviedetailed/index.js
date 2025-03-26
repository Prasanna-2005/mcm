import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './index.css';

const Eachmoviedetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const getMovieDetails = async () => {
            const url = `http://localhost:5002/movie/${id}`;
            const option = {
                method: 'GET',
                credentials: 'include'
            };
            const response = await fetch(url, option);
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                setMovie(data.data.movie);
            }
        };

        getMovieDetails();
    }, [id]);

    if (!movie) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="movie-detail-container">
            {/* Background Theme Image */}
            <div className="theme-banner" style={{ backgroundImage: `url(${movie.themeimageUrl})` }}>
                <h1 className="movie-title">{movie.title}</h1>
            </div>

            {/* Movie Details */}
            <div className="movie-content">
                {/* Left Section - Poster */}
                <div className="poster-container">
                    <img src={movie.posterimageUrl} alt={movie.title} className="poster-image" />
                </div>

                {/* Right Section - Movie Info */}
                <div className="movie-info">
                    <h2>{movie.title}</h2>
                    <p><strong>⭐ Rating:</strong> {movie.average_rating}</p>
                    <p><strong>📅 Release Year:</strong> {movie.release_year}</p>
                    <p><strong>⏳ Runtime:</strong> {movie.runtime} min</p>
                    <p><strong>🌍 Country:</strong> {movie.country}</p>
                    <p><strong>🗣️ Language:</strong> {movie.language}</p>
                    <p><strong>🎭 Genres:</strong> {movie.genres.map(g => g.name).join(", ")}</p>

                    {/* Synopsis */}
                    <p className="synopsis"><strong>📖 Synopsis:</strong> {movie.synopsis}</p>

                    {/* Cast & Crew */}
                    <h3>🎬 Cast & Crew</h3>
                    <ul className="cast-list">
                        {movie.castCrew.map((person, index) => (
                            <li key={index}>{person.name} - {person.role}</li>
                        ))}
                    </ul>

                    {/* Like & Watchlist Buttons */}
                    <div className="actions">
                        <button className={`like-btn ${movie.isliked ? "liked" : ""}`}>
                            {movie.isliked ? "❤️ Liked" : "🤍 Like"}
                        </button>
                        <button className={`watchlist-btn ${movie.isWatchlisted ? "watchlisted" : ""}`}>
                            {movie.isWatchlisted ? "✔️ Watchlisted" : "➕ Watchlist"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eachmoviedetails;
