import { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Eachmovie from '../eachmoviegrid';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import './home.css';
import '../eachmoviegrid/grid.css';

class Home extends Component {
    state = { 
        movies: [], 
        filter: 'latest', 
        selectedLanguage: 'English',
        selectedGenre: 'Action',
        isLoggedIn: false,
        redirectToLogin: false,
        error: null,
        searchQuery: '',
        allMovies: [] // Store all fetched movies for client-side search
    };

    componentDidMount() {
        this.checkLoginStatus();
        this.getMovies();
    }

    checkLoginStatus = async () => {
        try {
            const response = await fetch('http://localhost:5002/check-auth', { credentials: 'include' });
            const data = await response.json();
            if (data.isLoggedIn) {
                this.setState({ isLoggedIn: true });
            }
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    };

    getMovies = async () => {
        let { filter, selectedLanguage, selectedGenre, isLoggedIn } = this.state;
        let url = 'http://localhost:5002/movie_grid_layout';

        if (filter === 'top-rated') url = 'http://localhost:5002/movies/top-rated';
        else if (filter === 'language') url = `http://localhost:5002/movies/lang?language=${selectedLanguage}`;
        else if (filter === 'genre') url = `http://localhost:5002/movies/genre?genre=${selectedGenre}`;
        else if (filter === 'liked' || filter === 'watchlisted') {
            if (!isLoggedIn) {
                this.setState({ redirectToLogin: true });
                return;
            }
            url = filter === 'liked' ? 'http://localhost:5002/movies/liked' : 'http://localhost:5002/movies/watchlists';
        }

        try {
            const response = await fetch(url, { method: 'GET', credentials: 'include' });
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const data = await response.json();
            console.log(data);
            if (data.status === 'success') {
                this.setState({ 
                    movies: data.data.movies, 
                    allMovies: data.data.movies, // Store all fetched movies
                    error: null 
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            this.setState({ error: 'Failed to fetch movies. Please try again later.' });
        }
    };

    // Handle search input changes
    handleSearchChange = (e) => {
        const searchQuery = e.target.value;
        this.setState({ searchQuery }, this.filterMoviesBySearch);
    };

    // Filter movies based on search query
    filterMoviesBySearch = () => {
        const { searchQuery, allMovies } = this.state;
        
        if (!searchQuery.trim()) {
            // If search query is empty, show all movies
            this.setState({ movies: allMovies });
            return;
        }
        
        // Case-insensitive search in title and other relevant fields
        const filteredMovies = allMovies.filter(movie => {
            const query = searchQuery.toLowerCase();
            
            // Search in title
            if (movie.title && movie.title.toLowerCase().includes(query)) return true;
            
            // Search in genres if available
            if (movie.genres && Array.isArray(movie.genres)) {
                const genreMatch = movie.genres.some(genre => 
                    genre.name && genre.name.toLowerCase().includes(query)
                );
                if (genreMatch) return true;
            }
            
            // Search in language
            if (movie.language && movie.language.toLowerCase().includes(query)) return true;
            
            // Search in country
            if (movie.country && movie.country.toLowerCase().includes(query)) return true;
            
            return false;
        });
        
        this.setState({ movies: filteredMovies });
    };

    // Handle search form submission
    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.filterMoviesBySearch();
    };

    render() {
        const { movies, filter, selectedLanguage, selectedGenre, error, redirectToLogin, isLoggedIn, searchQuery } = this.state;

        if (redirectToLogin) {
            return <Navigate to="/login" />;
        }
    
        return (
            <div className="home-container">
                <Navbar className="custom-navbar sticky-navbar" expand="lg">
                    <Container fluid>
                        <Navbar.Brand className="cinehive-brand">
                            <p className="cinehive-link">CineHive</p>
                        </Navbar.Brand>
                        
                        <form className="navbar-search-form" onSubmit={this.handleSearchSubmit}>
                            <div className="search-input-container">
                                <input 
                                    type="text" 
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={this.handleSearchChange}
                                    className="navbar-search-input"
                                />
                                <button type="submit" className="search-icon-button">
                                    <i className="fa fa-search"></i>
                                </button>
                            </div>
                        </form>
                        
                        <Nav className="ms-auto">
                            <Link to="/profile">
                                <Button variant="outline-light" className="profile-btn">Profile</Button>
                            </Link>
                            <Link to="/">
                                <Button variant="danger" className="logout-btn">Logout</Button>
                            </Link>
                        </Nav>
                    </Container>
                </Navbar>

                <div className="content-wrapper">
                    <div className="sidebar">
                        <ul className="nav-links">
                            <li className={filter === 'latest' ? 'active' : ''} onClick={() => this.setState({ filter: 'latest' }, this.getMovies)}>Home</li>
                            <li className={filter === 'top-rated' ? 'active' : ''} onClick={() => this.setState({ filter: 'top-rated' }, this.getMovies)}>Top Rated</li>
                            <Dropdown>
                                <Dropdown.Toggle variant="light" className="dropdown-btn">
                                    By Language ({selectedLanguage})
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {['English', 'Tamil', 'Telugu', 'Malayalam'].map(lang => (
                                        <Dropdown.Item key={lang} onClick={() => this.setState({ selectedLanguage: lang, filter: 'language' }, this.getMovies)}>
                                            {lang}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </ul>
                    </div>

                    <div className="main-content">
                        {error && <p className="error-text">{error}</p>}

                        <div className="movies-grid">
                            {movies.length > 0 ? (
                                movies.map(eachmovie => (
                                    <Eachmovie details={eachmovie} key={eachmovie.id} />
                                ))
                            ) : (
                                !error && searchQuery ? (
                                    <p className="no-results">No movies found matching "{searchQuery}"</p>
                                ) : (
                                    !error && <p className="loading-text">Loading movies...</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;