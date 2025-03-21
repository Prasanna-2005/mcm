import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect,Link} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';



import './home.css'

class Home extends Component {
    render(){
        return(
            <div>
               <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#">CineHive </Navbar.Brand>
        
        <Nav className="ms-auto">
        <Link to="/profile">
            <Button variant="outline-light">Profile</Button>
          </Link>
          <Link to="/">
            <Button variant="outline-light" style={{marginLeft:"7px"}}>Logout</Button>
          </Link>
        </Nav>
      </Container>
    </Navbar>
            </div>
        )
    }
}
export default Home;