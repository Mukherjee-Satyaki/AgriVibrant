import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2, LogOut, User as UserIcon } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials(user.username)}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">{user.username}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          
          {user.farmName && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Farm Name</span>
              <span className="font-medium">{user.farmName}</span>
            </div>
          )}
          
          {user.location && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Location</span>
              <span className="font-medium">{user.location}</span>
            </div>
          )}
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Joined</span>
            <span className="font-medium">
              {user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric'
                  }) 
                : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline"
          className="w-full" 
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;