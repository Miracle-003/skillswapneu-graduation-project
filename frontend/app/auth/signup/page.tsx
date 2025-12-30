"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Mail, CheckCircle } from "lucide-react";
import { authService } from "@/lib/api/services/auth.service";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(120);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerificationPending(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("[fe] Attempting backend signup with email:", email);
      const response = await authService.register({ email, password });
      console.log("[fe] Signup successful; verification email sent");

      setVerificationPending(true);
      setExpiresIn(response.expiresInSeconds || 120);
    } catch (err: any) {
      console.error("[fe] Signup failed:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.register({ email, password });
      setExpiresIn(response.expiresInSeconds || 120);
      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to resend verification email",
      );
    } finally {
      setLoading(false);
    }
  };

  if (verificationPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription>We sent a verification link to</CardDescription>
            <p className="font-medium text-[#8B1538]">{email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-50 text-amber-900 border-amber-200">
              <AlertDescription>
                The verification link expires in{" "}
                <strong>{Math.round(expiresIn / 60)} minute(s)</strong>. Click
                the link in your email to verify your account.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Didn&apos;t receive the email?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam/junk folder</li>
                <li>Make sure {email} is correct</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full bg-transparent"
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </Button>
            <Button asChild className="w-full bg-[#8B1538] hover:bg-[#A91D3A]">
              <Link href="/auth/login">
                <CheckCircle className="w-4 h-4 mr-2" />
                I&apos;ve Verified - Go to Login
              </Link>
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Wrong email?{" "}
              <button
                onClick={() => setVerificationPending(false)}
                className="text-[#8B1538] hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Create Your Account
          </CardTitle>
          <CardDescription>
            Join SkillSwap and start collaborating
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#8B1538] hover:bg-[#A91D3A]"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#8B1538] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
