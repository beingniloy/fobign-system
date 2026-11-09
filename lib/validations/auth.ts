import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address or username is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().optional(),
    email: z
      .string()
      .min(1, { message: 'Email address is required.' })
      .email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[!@#$%^&*()_+={}|:;"'<>,.?/~`\-]/, {
        message: 'Password must contain at least one special character (!@#$).',
      })
      .regex(/\d/, { message: 'Password must contain at least one number (0-9).' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[!@#$%^&*()_+={}|:;"'<>,.?/~`\-]/, {
        message: 'Password must contain at least one special character (!@#$).',
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
