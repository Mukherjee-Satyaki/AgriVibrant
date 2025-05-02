import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="container max-w-md mx-auto py-12">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;