import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './signup.css';

class SignUpForm extends Component {
  state = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    isAdmin: false,
    adminKey: '',
    showSubmitError: false,
    errorMsg: '',
  };

  onChangeUsername = event => this.setState({ username: event.target.value });
  onChangePassword = event => this.setState({ password: event.target.value });
  onChangeConfirmPassword = event => this.setState({ confirmPassword: event.target.value });
  onChangeEmail = event => this.setState({ email: event.target.value });
  onChangeAdminKey = event => this.setState({ adminKey: event.target.value });
  toggleAdmin = () => this.setState(prevState => ({ isAdmin: !prevState.isAdmin }));

  
  submitForm = async event => {
    event.preventDefault();
    const { username, email, password, confirmPassword, isAdmin, adminKey } = this.state;
  
    if (password !== confirmPassword) {
      this.setState({ showSubmitError: true, errorMsg: 'Passwords do not match' });
      return;
    }
  
    if (isAdmin && adminKey !== "TVK") {
      this.setState({ showSubmitError: true, errorMsg: 'Invalid admin key' });
      return;
    }
  
    const userDetails = { username, email, password };
  
    try {
      const response = await fetch('http://localhost:5002/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      });
  
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
  
      alert('Registration successful! You can now log in.');
    } catch (error) {
      this.setState({ showSubmitError: true, errorMsg: error.message });
    }
  };
  

  render() {
    const { showSubmitError, errorMsg, isAdmin, adminKey } = this.state;
    return (
      <div className="sign-up-form-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <h2>Sign Up</h2>
          <div className="input-container"><input type="text" placeholder="Username" onChange={this.onChangeUsername} /></div>
          <div className="input-container"><input type="email" placeholder="Email" onChange={this.onChangeEmail} /></div>
          <div className="input-container"><input type="password" placeholder="Password" onChange={this.onChangePassword} /></div>
          <div className="input-container"><input type="password" placeholder="Confirm Password" onChange={this.onChangeConfirmPassword} /></div>
          
          <div className="checkbox-container">
            <input type="checkbox" id="adminCheck" checked={isAdmin} onChange={this.toggleAdmin} />
            <label htmlFor="adminCheck">Register as Admin</label>
          </div>
          
          {isAdmin && (
            <div className="input-container">
              <input type="text" placeholder="Enter Admin Key" value={adminKey} onChange={this.onChangeAdminKey} />
            </div>
          )}
          
          <button type="submit" className="sign-up-button">Sign Up</button>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}
          <p>Already have an account?<Link to="/login"> Login</Link></p>
        </form>
      </div>
    );
  }
}

export default SignUpForm;