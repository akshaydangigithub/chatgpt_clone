"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/lib/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";

export function RegisterForm() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const submitting = registerMutation.isPending;

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="jane.doe"
          aria-invalid={Boolean(errors.username)}
          {...register("username")}
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
