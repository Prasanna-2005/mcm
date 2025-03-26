import './index.css';
import { Component } from 'react';
import { Link } from 'react-router-dom';

class Eachmovie extends Component {
    render() {
        const { details } = this.props;
        const { average_rating, id, imageUrl, isLiked, isWatchlisted, title } = details;

        return (
            <div className="video-card">
                <Link to={`/movie/${id}`} className="card-link">
                    <img src={imageUrl} alt={title} className="thumbnail" />
                    <div className="video-info">
                        <h3 className="title">{title}</h3>
                        <p className="rating">⭐ {average_rating}</p>
                    </div>
                </Link>pip
                {/* Like & Watchlist Buttons */}
                <div className="actions">
                    <button 
                        className={`like-btn ${isLiked ? 'liked' : ''}`} 
                        onClick={(e) => e.preventDefault()}
                    >
                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                    </button>
                    <button 
                        className={`watchlist-btn ${isWatchlisted ? 'watchlisted' : ''}`} 
                        onClick={(e) => e.preventDefault()}
                    >
                        {isWatchlisted ? '✔️ Watchlisted' : '➕ Watchlist'}
                    </button>
                </div>
            </div>
        );
    }
}

export default Eachmovie;
