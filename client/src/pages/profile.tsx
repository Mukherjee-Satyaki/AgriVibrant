import React from 'react';
import UserProfile from '../components/auth/UserProfile';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const ProfilePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="container max-w-md mx-auto py-12">
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;