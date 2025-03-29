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
        redirectToLogin: false,
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

    render() {
        const { movies, filter, selectedLanguage, selectedGenre, error, redirectToLogin, isLoggedIn } = this.state;

        if (redirectToLogin) {
            return <Navigate to="/login" />;
        }

        return (
            <div className="home-container">
                <Navbar className="custom-navbar">
                    <Container fluid>
                        <Navbar.Brand className="cinehive-brand">
                            <Link to={isLoggedIn ? "/home" : "/"} className="cinehive-link">CineHive</Link>
                        </Navbar.Brand>
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
                            <li className={filter === 'liked' ? 'active' : ''} onClick={() => this.setState({ filter: 'liked', redirectToLogin: !this.state.isLoggedIn }, this.getMovies)}>Liked</li>
                            <li className={filter === 'watchlisted' ? 'active' : ''} onClick={() => this.setState({ filter: 'watchlisted', redirectToLogin: !this.state.isLoggedIn }, this.getMovies)}>Watchlisted</li>

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

                            <Dropdown>
                                <Dropdown.Toggle variant="light" className="dropdown-btn">
                                    By Genre ({selectedGenre})
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'].map(genre => (
                                        <Dropdown.Item key={genre} onClick={() => this.setState({ selectedGenre: genre, filter: 'genre' }, this.getMovies)}>
                                            {genre}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </ul>
                    </div>

                    <div className="main-content">
                        <div className="search-bar">
                            <input type="text" placeholder="Search" />
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <div className="movies-grid">
                            {movies.length > 0 ? (
                                movies.map(eachmovie => (
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
