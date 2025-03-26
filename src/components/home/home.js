import { Component } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Eachmovie from '../eachmoviegrid';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import './home.css';

class Home extends Component {
    state = { movies: [] }

    getmovies = async () => {
        const url = 'http://localhost:5002/movie_grid_layout';
        const option = {
            method: 'GET',
            credentials: 'include'
        };
        const response = await fetch(url, option);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            this.setState({ movies: data.data.movies });
        }
    }

    componentDidMount() {
        this.getmovies();
    }

    render() {
        const { movies } = this.state;

        return (
            <div className="home-container">
                {/* Navbar - Full Width, Dark Background */}
                <Navbar className="custom-navbar">
                    <Container fluid>
                        {/* CineHive Branding */}
                        <Navbar.Brand className="cinehive-brand">CineHive</Navbar.Brand>

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

                {/* Sidebar & Content Wrapper */}
                <div className="content-wrapper">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <ul className="nav-links">
                            <li className="active">Home</li>
                            <li>Trending</li>
                            <li>Gaming</li>
                            <li>Saved videos</li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="main-content">
                        {/* Search Bar */}
                        <div className="search-bar">
                            <input type="text" placeholder="Search" />
                        </div>

                        {/* Movie Grid */}
                        <div className="movies-grid">
                            {movies.length > 0 ? (
                                movies.map(eachmovie => (
                                    <Eachmovie details={eachmovie} key={eachmovie.id} />
                                ))
                            ) : (
                                <p className="loading-text">Loading movies...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
