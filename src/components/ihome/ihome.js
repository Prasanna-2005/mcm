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
        isLoggedIn: false,  // Assume user is not logged in initially
        error: null
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
        let url = 'http://localhost:5002/movie_grid_layout'; // Default (Latest Movies)

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
                this.setState({ movies: data.data.movies, error: null });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            this.setState({ error: 'Failed to fetch movies. Please try again later.' });
        }
    };

    handleFilterChange = (filter) => {
        if ((filter === 'liked' || filter === 'watchlisted') && !this.state.isLoggedIn) {
            this.setState({ redirectToLogin: true });
            return;
        }
    
        this.setState({ filter, redirectToLogin: false }, () => {
            this.getMovies();
        });
    };
    

    handleLanguageChange = (language) => {
        this.setState({ selectedLanguage: language, filter: 'language' }, () => {
            this.getMovies();
        });
    };

    handleGenreChange = (genre) => {
        this.setState({ selectedGenre: genre, filter: 'genre' }, () => {
            this.getMovies();
        });
    };

    render() {
        const { movies, filter, selectedLanguage, selectedGenre, error, redirectToLogin } = this.state;

        if (this.state.redirectToLogin) {
            return <Navigate to="/login" />;
        }

        return (
            <div className="home-container">
                {/* Navbar */}
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

                {/* Sidebar & Content */}
                <div className="content-wrapper">
                    {/* Sidebar with Filters */}
                    <div className="sidebar">
                        <ul className="nav-links">
                            <li className={filter === 'latest' ? 'active' : ''} onClick={() => this.handleFilterChange('latest')}>Home</li>
                            <li className={filter === 'top-rated' ? 'active' : ''} onClick={() => this.handleFilterChange('top-rated')}>Top Rated</li>
                            <li className={filter === 'liked' ? 'active' : ''} onClick={() => this.handleFilterChange('liked')}>Liked</li>
                            <li className={filter === 'watchlisted' ? 'active' : ''} onClick={() => this.handleFilterChange('watchlisted')}>Watchlisted</li>

                            {/* Dropdown for Language */}
                            <Dropdown>
                                <Dropdown.Toggle variant="light" className="dropdown-btn">
                                    By Language ({selectedLanguage})
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {['English', 'Tamil', 'Telugu', 'Malayalam'].map(lang => (
                                        <Dropdown.Item key={lang} onClick={() => this.handleLanguageChange(lang)}>
                                            {lang}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>

                            {/* Dropdown for Genre */}
                            <Dropdown>
                                <Dropdown.Toggle variant="light" className="dropdown-btn">
                                    By Genre ({selectedGenre})
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'].map(genre => (
                                        <Dropdown.Item key={genre} onClick={() => this.handleGenreChange(genre)}>
                                            {genre}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="main-content">
                        {/* Search Bar */}
                        <div className="search-bar">
                            <input type="text" placeholder="Search" />
                        </div>

                        {/* Error Message */}
                        {error && <p className="error-text">{error}</p>}

                        {/* Movie Grid */}
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
