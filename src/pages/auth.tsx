import { useSearchParams } from "react-router-dom";
import { AuthContainer } from "@/components/auth";
import { AnimatedPage } from "@/components/animated-page";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const defaultMode = modeParam === "signup" ? "signup" : "login";

  return (
    <AnimatedPage>
      <AuthContainer defaultMode={defaultMode} />
    </AnimatedPage>
  );
}
