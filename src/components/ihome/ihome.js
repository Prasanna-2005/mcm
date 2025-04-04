import { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Eachmovie from '../eachmoviegrid';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import './home.css';

class Home extends Component {
    state = { 
        movies: [], 
        filter: 'latest', 
        selectedLanguage: 'English',
        selectedGenre: 'Action',
        isLoggedIn: false,
        error: null
    };

    componentDidMount() {
        this.checkLoginStatus();
        this.getMovies();
    }

// For your Home component
checkLoginStatus = async () => {
    try {
        const response = await fetch('http://localhost:5002/auth/profile', {
            credentials: 'include'
        });
        
        // Check if response is OK before trying to parse JSON
        if (response.ok) {
            const userData = await response.json();
            this.setState({ isLoggedIn: true });
            // Set any other user data you need
        } else {
            this.setState({ isLoggedIn: false });
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        this.setState({ isLoggedIn: false });
    }
};

    getMovies = async () => {
        let { filter, selectedLanguage, selectedGenre, isLoggedIn } = this.state;
        let url = 'http://localhost:5002/movie_grid_layout';
    
        if (filter === 'top-rated') url = 'http://localhost:5002/movies/top-rated';
        else if (filter === 'language') url = `http://localhost:5002/movies/lang?language=${selectedLanguage}`;
        else if (filter === 'genre') url = `http://localhost:5002/movies/genre?genre=${selectedGenre}`;
        else if (filter === 'liked' || filter === 'watchlisted') {
            if (!isLoggedIn) return this.setState({ redirectToLogin: true });
            url = filter === 'liked' ? 'http://localhost:5002/movies/liked' : 'http://localhost:5002/movies/watchlists';
        }
    
        try {
            const response = await fetch(url, { method: 'GET', credentials: 'include' });
    
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    
            const data = await response.json();
            if (data.status === 'success') {
                // Ensure like/watchlist status is included in movies
                const updatedMovies = data.data.movies.map(movie => ({
                    ...movie,
                    isLiked: movie.isLiked || false,  // Fetch from backend
                    isWatchlisted: movie.isWatchlisted || false  // Fetch from backend
                }));
                this.setState({ movies: updatedMovies, error: null });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            this.setState({ error: 'Failed to fetch movies. Please try again later.' });
        }
    };
    

    render() {
        const { movies, filter, selectedLanguage, selectedGenre, error, redirectToLogin } = this.state;

        if (this.state.redirectToLogin) {
            return <Navigate to="/login" />;
        }

        return (
            <div className="home-container">
                <Navbar className="custom-navbar">
                    <Container fluid>
                        <Navbar.Brand className="cinehive-brand">CineHive</Navbar.Brand>
                        <Nav className="ms-auto">
                            <Link to="/login">
                                <Button variant="danger" className="logout-btn">Login</Button>
                            </Link>
                        </Nav>
                    </Container>
                </Navbar>

                <div className="content-wrapper">
                    <div className="sidebar">
                        <ul className="nav-links">
                            <li className={filter === 'latest' ? 'active' : ''} onClick={() => this.handleFilterChange('latest')}>Home</li>
                            <li className={filter === 'top-rated' ? 'active' : ''} onClick={() => this.handleFilterChange('top-rated')}>Top Rated</li>
                            <li className={filter === 'liked' ? 'active' : ''} onClick={() => this.handleFilterChange('liked')}>Liked</li>
                            <li className={filter === 'watchlisted' ? 'active' : ''} onClick={() => this.handleFilterChange('watchlisted')}>Watchlisted</li>
                        </ul>
                    </div>

                    <div className="main-content">
                        <div className="search-bar">
                            <input type="text" placeholder="Search" />
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <div className="movies-grid">
                            {movies.length > 0 ? (
                                movies.map((eachmovie) => (
                                    <Eachmovie details={eachmovie} key={eachmovie.id} />
                                ))
                            ) : (
                                !error && <p className="loading-text">Loading movies...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
