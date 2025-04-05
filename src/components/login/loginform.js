import { Component } from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import './login.css';

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    showSubmitError: false,
    errorMsg: '',
    isLoading: false
  };

  onChangeUsername = (event) => {
    this.setState({ username: event.target.value });
  };

  onChangePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  onSubmitSuccess = (jwtToken) => {
    Cookies.set('jwt_token', jwtToken, { expires: 30 });
    // Redirect to home page
    this.props.navigate('/home');
  };

  onSubmitFailure = (errorMsg) => {
    this.setState({ showSubmitError: true, errorMsg, isLoading: false });
  };

  submitForm = async (event) => {
    event.preventDefault();
    this.setState({ isLoading: true, showSubmitError: false });
    
    const { username, password } = this.state;
    const email = username;

    try {
      const response = await fetch('http://localhost:5002/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Save session data
      localStorage.setItem('user', JSON.stringify(data.user));
      this.onSubmitSuccess(data.token);
    } catch (error) {
      this.onSubmitFailure(error.message);
    }
  };

  render() {
    const { username, password, showSubmitError, errorMsg, isLoading } = this.state;
    
    return (
      <div className="netflix-login-container">
        <div className="netflix-header">
          <div className="netflix-logo">CineHive</div>
        </div>
        
        <div className="netflix-login-form-wrapper">
          <div className="netflix-login-form">
            <h1>Sign In</h1>
            
            {showSubmitError && (
              <div className="netflix-error-message">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={this.submitForm}>
              <div className="netflix-form-group">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={this.onChangeUsername}
                  className="netflix-form-input"
                  placeholder=" "
                  required
                />
                <label htmlFor="username" className="netflix-form-label">Email</label>
              </div>
              
              <div className="netflix-form-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={this.onChangePassword}
                  className="netflix-form-input"
                  placeholder=" "
                  required
                />
                <label htmlFor="password" className="netflix-form-label">Password</label>
              </div>
              
              <button 
                type="submit" 
                className="netflix-signin-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="netflix-signup-now">
              New to CineHive? <Link to="/signup" className="netflix-signup-link">Sign up now</Link>
            </div>
            
            <div className="netflix-recaptcha-terms">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.
            </div>
          </div>
        </div>
        
        <div className="netflix-footer">
          <div className="netflix-footer-content">
            <div className="netflix-footer-top">Questions? Call +91 9344924192</div>
            <div className="netflix-footer-links">
              <a >FAQ</a>
              <a >Help Center</a>
              <a >Terms of Use</a>
              <a >Privacy</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginForm;