import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import React from "react";

/**
 * LoginForm - Handles user authentication input.
 * @param {string} username - Current username value.
 * @param {string} password - Current password value.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onUsernameChange - Handler for username input.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onPasswordChange - Handler for password input.
 * @param {(e: React.FormEvent) => void} onSubmit - Handler for form submission.
 * @param {boolean} isLoading - Whether the login is in progress.
 * @param {string} error - Error message to display.
 */
export interface LoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ username, password, onUsernameChange, onPasswordChange, onSubmit, isLoading, error }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-500" /> REGEX GENERATOR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={onUsernameChange}
              required
              placeholder="Enter username"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={onPasswordChange}
              required
              placeholder="Enter password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default LoginForm; 