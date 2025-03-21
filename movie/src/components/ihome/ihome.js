import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect,Link} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';



import './home.css'

class Ihome extends Component {
    render(){
        return(
            <div>
               <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#">CineHive </Navbar.Brand>
        <Nav className="ms-auto">
          <Link to="/login">
            <Button variant="outline-light">Login</Button>
          </Link>
        </Nav>
      </Container>
    </Navbar>
            </div>
        )
    }
}
export default Ihome;