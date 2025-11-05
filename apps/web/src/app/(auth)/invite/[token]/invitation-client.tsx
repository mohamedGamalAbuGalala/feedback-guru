"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Building2, Shield } from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  workspace: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface InvitationClientProps {
  invitation: Invitation;
}

export function InvitationClient({ invitation }: InvitationClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState("");

  // Registration form state (for new users)
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isExistingUser = status === "authenticated";
  const isNewUser = !isExistingUser;

  const handleAccept = async () => {
    if (isNewUser && (!name || !password || password !== confirmPassword)) {
      setError("Please fill in all fields correctly");
      return;
    }

    setIsAccepting(true);
    setError("");

    try {
      // If new user, register first
      if (isNewUser) {
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: invitation.email,
            name,
            password,
          }),
        });

        if (!registerResponse.ok) {
          const data = await registerResponse.json();
          throw new Error(data.error || "Registration failed");
        }

        // Sign in the new user
        const signInResult = await signIn("credentials", {
          email: invitation.email,
          password,
          redirect: false,
        });

        if (!signInResult?.ok) {
          throw new Error("Failed to sign in after registration");
        }
      }

      // Accept the invitation
      const response = await fetch("/api/team/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invitation.token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    setError("");

    try {
      const response = await fetch("/api/team/decline-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invitation.token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to decline invitation");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to decline invitation");
    } finally {
      setIsDeclining(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "MEMBER":
        return "bg-green-100 text-green-800";
      case "VIEWER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">You've Been Invited!</CardTitle>
          <CardDescription>
            Join your team on Feedback Guru
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Workspace Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {invitation.workspace.image ? (
                <img
                  src={invitation.workspace.image}
                  alt={invitation.workspace.name}
                  className="w-12 h-12 rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg">{invitation.workspace.name}</div>
                <div className="text-sm text-gray-600">{invitation.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Role:</span>
              <Badge className={getRoleBadgeColor(invitation.role)}>
                {invitation.role}
              </Badge>
            </div>
          </div>

          {/* New User Registration Form */}
          {isNewUser && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 text-center">
                Create your account to accept this invitation
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Existing User Message */}
          {isExistingUser && (
            <div className="text-center text-sm text-gray-600">
              You're signed in as <strong>{session?.user?.email}</strong>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isAccepting ? "Accepting..." : "Accept Invitation"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
              className="w-full"
            >
              {isDeclining ? "Declining..." : "Decline"}
            </Button>
          </div>

          {/* Login Link for Existing Users */}
          {isNewUser && (
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 hover:underline">
                Sign in
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
