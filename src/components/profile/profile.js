import React, { useEffect, useState } from 'react';
import '../eachmoviegrid/grid.css';
import Eachmovie from '../eachmoviegrid';
import './profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [likedMovies, setLikedMovies] = useState([]);
    const [watchlistMovies, setWatchlistMovies] = useState([]);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isLikedLoading, setIsLikedLoading] = useState(true);
    const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);

    useEffect(() => {
        // Fetch profile data
        fetch('http://localhost:5002/profile', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setIsProfileLoading(false);
            })
            .catch(err => {
                console.error('Error fetching profile:', err);
                setIsProfileLoading(false);
            });
        
        // Fetch user's liked movies
        fetch('http://localhost:5002/movies/liked', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                console.log('Liked movies data:', data.data.movies);
                if (data.data?.movies) {
                    setLikedMovies(
                        data.data.movies.map(movie => ({
                            ...movie,
                            isLiked: true
                        }))
                    );
                }
                setIsLikedLoading(false);
            })
            .catch(err => {
                console.error('Error fetching liked movies:', err);
                setIsLikedLoading(false);
            });
        
        // Fetch user's watchlisted movies
        fetch('http://localhost:5002/movies/watchlists', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                console.log('Watchlist movies data:', data.data.movies);
                if (data.data?.movies) {
                    setWatchlistMovies(
                        data.data.movies.map(movie => ({
                            ...movie,
                            isWatchlisted: true
                        }))
                    );
                }
                setIsWatchlistLoading(false);
            })
            .catch(err => {
                console.error('Error fetching watchlist:', err);
                setIsWatchlistLoading(false);
            });
    }, []);

    // Format movies data for Eachmovie component
    const formatMovieData = (movies) => {
        return movies.map(movie => ({
            id: movie.id || movie.movie_id,
            posterImageUrl: movie.poster_path ? 
                `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
                (movie.posterImageUrl || '/placeholder-poster.jpg'),
            title: movie.title || movie.name,
            isLiked: movie.isLiked || false,
            isWatchlisted: movie.isWatchlisted || false
        }));
    };

    const isLoading = isProfileLoading || isLikedLoading || isWatchlistLoading;

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <h2>Profile</h2>
                <div className="profile-info">
                    
                    <p><strong>Username:</strong> {profile.username}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                </div>
            </div>

            {/* Liked Movies Section */}
            <div className="movies-section">
                <h2>Liked Movies</h2>
                {likedMovies.length > 0 ? (
                    <div className="video-grid">
                        {formatMovieData(likedMovies).map(eachmovie => (
                            <Eachmovie details={eachmovie} key={eachmovie.id} />
                        ))}
                    </div>
                ) : (
                    <p className="no-movies">No liked movies found.</p>
                )}
            </div>
            
            {/* Watchlist Movies Section */}
            <div className="movies-section">
                <h2>My Watchlist</h2>
                {watchlistMovies.length > 0 ? (
                    <div className="video-grid">
                        {formatMovieData(watchlistMovies).map(eachmovie => (
                            <Eachmovie details={eachmovie} key={eachmovie.id} />
                        ))}
                    </div>
                ) : (
                    <p className="no-movies">No watchlisted movies found.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
