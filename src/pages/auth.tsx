import { AuthContainer } from "@/components/auth";
import { AnimatedPage } from "@/components/animated-page";

export default function AuthPage() {
  return (
    <AnimatedPage>
      <AuthContainer defaultMode="login" />
    </AnimatedPage>
  );
}
