export const getAuthErrorMessage = (error: any): string => {
  if (!error) return "An unknown error occurred.";

  if (error.message) {
    // Supabase AuthApiError messages
    if (error.message.includes("Email not confirmed")) {
      return "Please confirm your email address to log in.";
    }
    if (error.message.includes("Invalid login credentials")) {
      return "Invalid email or password.";
    }
    if (error.message.includes("User already registered")) {
      return "An account with this email already exists. Please log in.";
    }
    if (error.message.includes("Password should be at least 6 characters")) {
      return "Password must be at least 6 characters long.";
    }
    if (error.message.includes("User not found")) {
      return "No account found with this email.";
    }
    if (error.message.includes("Email link is invalid or has expired")) {
      return "The email link is invalid or has expired. Please try signing in again.";
    }
    if (error.message.includes("Email rate limit exceeded")) {
      return "Too many requests. Please try again later.";
    }
    if (error.message.includes("Phone number format is invalid")) {
      return "Invalid phone number format.";
    }
    if (error.message.includes("Terms and conditions must be accepted")) {
      return "You must accept the terms and conditions.";
    }
    return error.message;
  }
  return "An unexpected error occurred during authentication.";
};