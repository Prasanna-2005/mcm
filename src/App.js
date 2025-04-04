import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/login/loginform";
import SignupForm from "./components/signup/signupform";
import Ihome from "./components/ihome/ihome";
import Home from "./components/home/home";
import LoginFormWrapper from "./components/LoginFormWrapper";
import Eachmoviedetails from "./components/eachmoviedetailed";  
import "./App.css"; // Import global styles
import Profile from "./components/profile/profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Ihome/>} />
        <Route path="/profile" element={<Profile/>} /> 
        <Route path="/login" element={<LoginFormWrapper />} />
        <Route path="/logout" element={<Ihome />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/movie/:id" element={<Eachmoviedetails/>}/>
      </Routes>
    </Router>
  );
};

export default App;
