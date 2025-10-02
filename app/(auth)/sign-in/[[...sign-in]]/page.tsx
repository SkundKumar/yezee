import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: 'bg-black hover:bg-gray-800 text-sm normal-case',
          footerActionLink: 'text-black hover:text-gray-800',
          card: 'shadow-none border border-gray-200',
        },
      }}
    />
  );
}