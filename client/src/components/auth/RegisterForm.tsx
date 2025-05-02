import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

// Import shadcn components
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';

// Registration form schema
const registerFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  farmName: z.string().optional(),
  location: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Registration form values type
type RegisterFormValues = z.infer<typeof registerFormSchema>;

const RegisterForm: React.FC = () => {
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      farmName: '',
      location: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    clearError();
    // Remove confirmPassword as it's not needed in the API call
    const { confirmPassword, ...userData } = values;
    await register(userData);
  };

  // Handle form errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Registration Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Join our agricultural platform to access marketplace, bidding, and information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Choose a username"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Create password"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm password"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="farmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your farm name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your location"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => setLocation('/login')}
          >
            Login here
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;