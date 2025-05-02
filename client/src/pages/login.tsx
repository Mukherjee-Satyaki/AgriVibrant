import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="container max-w-md mx-auto py-12">
      <LoginForm />
    </div>
  );
};

export default LoginPage;