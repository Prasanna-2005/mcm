import './grid.css';
import { Component } from 'react';
import { Link } from 'react-router-dom';

class Eachmovie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLiked: props.details.isLiked, // Preserve state across refresh
            isWatchlisted: props.details.isWatchlisted,
            
        };
    }

    

    render() {
        const { details } = this.props;
        const { id, posterImageUrl, title } = details;
        const { isLiked, isWatchlisted } = this.state;

        return (
            <div className="video-card">
                <Link to={`/movie/${id}`} className="card-link">
                    <img src={posterImageUrl} alt={title} className="thumbnail" />
                    <div className="video-info">
                        <h3 className="title">{title}</h3>
                    </div>
                </Link>
                
                
            </div>
        );
    }
}

export default Eachmovie;