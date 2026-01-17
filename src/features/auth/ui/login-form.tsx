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
import { loginFn } from '../server';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await loginFn({ data: value });
        if (res.error) {
          toast.error(res.error);
          return;
        }

        toast.success('Successfully logged in!');
        // No manual navigation needed if server function handles redirect,
        // BUT our loginFn does NOT redirect yet (it updates session).
        // Let's check loginFn implementation again...
        // Ah, current loginFn implementation returns user/success, doesn't throw redirect.
        // So we should navigate here or update loginFn.
        // Let's stick to client-side navigation for better UX control or refresh context?
        // Wait, if we use separate server/client split, usually server func redirects.
        // In the docs example, loginFn throws redirect.
        // My implementation returned json. I should trust my implementation: returns { success: true, user }

        // We need to invalidate router context or query cache to refresh session data?
        // router.invalidate() is standard.
        await navigate({ to: '/dashboard' });
      } catch (error) {
        toast.error('Failed to login. Please check your credentials.');
        console.error(error);
      }
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your workspace</CardDescription>
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
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.map((e: any) => e.message || e).join(', ')}
                  </p>
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
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.map((e: any) => e.message || e).join(', ')}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
