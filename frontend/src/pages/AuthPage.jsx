import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RegisterForm from "../components/authComps/RegisterComp";
import LoginForm from "../components/authComps/LoginForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, user, error, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (user?.role) navigate("/dashboard");
  }, [user, navigate]);

  const handleRegister = async (formData) => {
    const success = await register(formData);
    if (success) setIsLogin(true); // switch to login after register
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm
          onLogin={login}
          switchToRegister={() => setIsLogin(false)}
          error={error}
          loading={loading}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          switchToLogin={() => setIsLogin(true)}
          error={error}
          loading={loading}
        />
      )}
    </div>
  );
};


export default AuthPage