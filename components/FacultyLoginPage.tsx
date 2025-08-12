"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedAuthSystem from "./EnhancedAuthSystem";

interface FacultyLoginPageProps {
  onBack: () => void;
}

export default function FacultyLoginPage({ onBack }: FacultyLoginPageProps) {
  const { setUser } = useAuth();
  const router = useRouter();

  const handleLoginSuccess = (user: any) => {
    setUser(user); // Update global state
    router.push("/dashboard"); // Redirect to dashboard
  };

  const handleSignupSuccess = (user: any) => {
    // For now, the signup flow also redirects to the dashboard
    // In a real multi-step signup, this would trigger the next step
    setUser(user);
    router.push("/dashboard?new_user=true");
  };

  return (
    <EnhancedAuthSystem
      userType="faculty"
      onBackAction={onBack}
      onLoginSuccessAction={handleLoginSuccess}
      onSignupSuccessAction={handleSignupSuccess}
    />
  );
}