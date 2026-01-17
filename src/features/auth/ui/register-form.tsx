import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { toast } from 'sonner';
import { api } from '@/shared/api/api';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
    firstName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      orgName: '',
      firstName: '',
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Remove confirmPassword before sending to API if the backend doesn't expect it, or let the backend ignore it.
        // Based on previous verification, backend RegisterDto allows optional firstName, requires email, password, orgName.
        const { confirmPassword, ...dataToSend } = value;

        const res = await api.post('auth/register', { json: dataToSend }).json<any>();
        localStorage.setItem('accessToken', res.accessToken);
        toast.success('Registration successful! Welcome to TezDoc.');
        navigate({ to: '/' });
      } catch (error) {
        toast.error('Failed to register. Please try again.');
        console.error(error);
      }
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Get started with your new workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4">
          <form.Field
            name="orgName"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Organization Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Acme Corp"
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="firstName"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Full Name (Optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="John Doe"
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="you@example.com"
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Confirm Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
