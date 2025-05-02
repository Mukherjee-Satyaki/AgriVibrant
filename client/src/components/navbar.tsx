import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useMobile();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  // Close menu on location change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [setLocation]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Digital Bidding", path: "/bidding" },
    { name: "Agri Assistant", path: "/chatbot" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <i className="fas fa-leaf text-primary-500 text-3xl"></i>
            <span className="font-heading font-bold text-xl text-neutral-800">
              Agri<span className="text-primary-600">Vibrant</span>
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                className="font-ui font-medium text-neutral-800 hover:text-primary-600 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setLocation('/profile')}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:block text-primary-600 hover:text-primary-700 font-medium transition"
                  onClick={() => setLocation('/login')}
                >
                  Login
                </Button>
                <Button 
                  className="hidden md:block bg-primary-600 hover:bg-primary-700 text-white font-medium"
                  onClick={() => setLocation('/register')}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost"
              className="md:hidden text-neutral-700 p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobile && (
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} py-4 border-t`}>
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="font-ui font-medium text-neutral-800 hover:text-primary-600 transition"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 border-t">
                {isAuthenticated && user ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      className="justify-start"
                      onClick={() => setLocation('/profile')}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Button>
                    <Button 
                      variant="ghost"
                      className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Button 
                      variant="ghost"
                      className="text-primary-600 hover:text-primary-700 font-medium transition"
                      onClick={() => setLocation('/login')}
                    >
                      Login
                    </Button>
                    <Button 
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium"
                      onClick={() => setLocation('/register')}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
