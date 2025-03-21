import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const MyNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (from sessionStorage)
    const userSession = sessionStorage.getItem('isLoggedIn');
    setIsLoggedIn(userSession === 'true');
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include session cookie
      });

      if (response.ok) {
        sessionStorage.removeItem('isLoggedIn'); // Remove session storage
        navigate('/login'); // Redirect to login page
      }
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">MovieDB</Navbar.Brand>
        <Nav className="ms-auto">
          {isLoggedIn ? (
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline-light">Login</Button>
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
