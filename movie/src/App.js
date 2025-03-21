import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/login/loginform";
import SignupForm from "./components/signup/signupform";
import Home from "./components/home/home";
import "./App.css"; // Import global styles

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/home" element={<Home/>}/>
      </Routes>
    </Router>
  );
};

export default App;
