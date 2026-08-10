import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center px-6">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/register"
        afterSignInUrl="/"
        appearance={{
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#121217",
            colorText: "#ffffff",
            colorInputBackground: "#08080a",
            colorInputText: "#ffffff",
          },
        }}
      />
    </div>
  );
}