"use client"

import type React from "react";
import { useRouter } from "next/navigation";
import EnhancedAuthSystem from "./EnhancedAuthSystem";

/**
 * This page component manages the authentication flow for student members.
 * It uses the EnhancedAuthSystem to handle both login and signup processes.
 */
export default function StudentLoginPage() {
  const router = useRouter();

  /**
   * Handles successful login by redirecting the user to the student dashboard.
   */
  const handleLoginSuccessAction = (userData: any) => {
    console.log("Student login successful, redirecting...", userData);
    router.push('/student-dashboard');
  };

  /**
   * Handles the completion of the multi-step signup process.
   */
  const handleSignupSuccessAction = (userData: any) => {
    console.log("Student signup complete, redirecting...", userData);
    router.push('/student-dashboard');
  };

  return (
    <EnhancedAuthSystem
      userType="student"
      onLoginSuccessAction={handleLoginSuccessAction}
      onSignupSuccessAction={handleSignupSuccessAction}
      onBackAction={() => router.push('/')} // Example: Redirect to home on back
    />
  );
}
