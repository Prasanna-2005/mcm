import { useNavigate } from 'react-router-dom';
import LoginForm from './login/loginform';

const LoginFormWrapper = () => {
  const navigate = useNavigate();
  return <LoginForm navigate={navigate} />;
};

export default LoginFormWrapper;
