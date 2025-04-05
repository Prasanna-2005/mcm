import { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import './home.css';

class Home extends Component {
    state = { 
        isLoggedIn: false,
        error: null
    };

    componentDidMount() {
        this.checkLoginStatus();
        // Add Font Awesome for icons
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js';
        script.async = true;
        document.body.appendChild(script);
        
        // Add Google Fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    checkLoginStatus = async () => {
        try {
            const response = await fetch('http://localhost:5002/auth/profile', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.setState({ isLoggedIn: true });
            } else {
                this.setState({ isLoggedIn: false });
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.setState({ isLoggedIn: false });
        }
    };

    render() {
        // If user is already logged in, show the regular movie grid
        if (this.state.isLoggedIn) {
            return <Navigate to="/home" />;  // Redirect to a movies route
        }

        return (
            <div className="welcome-screen">
                <Navbar className="custom-navbar">
                    <Container fluid>
                        <Navbar.Brand className="cinehive-brand">CineHive</Navbar.Brand>
                    </Container>
                </Navbar>

                <div className="welcome-content">
                    <div className="welcome-text">
                        <h1>Track films you've watched.</h1>
                        <h1>Save those you want to see.</h1>
                        <h1>Tell your friends what's good.</h1>
                        <p className="subtitle">Join the community of film enthusiasts today!</p>
                    </div>
                    
                    <div className="welcome-buttons">
                        <Link to="/login">
                            <Button variant="danger" className="welcome-btn login-btn">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="outline-light" className="welcome-btn register-btn">Join CineHive</Button>
                        </Link>
                    </div>
                    
                    <p className="social-text">The social network for film lovers.</p>
                    <div className="platform-icons">
                        <span className="platform-icon"><i className="fab fa-apple"></i></span>
                        <span className="platform-icon"><i className="fab fa-android"></i></span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;