import { SignUp } from "@clerk/clerk-react";

export default function Register() {
  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center px-6">
      <SignUp
        routing="path"
        path="/register"
        signInUrl="/login"
        fallbackRedirectUrl="/"
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