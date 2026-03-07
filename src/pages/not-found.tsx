import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <AnimatedPage className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <div className="mt-6 flex gap-4">
        <Link to="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button className="bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </AnimatedPage>
  );
}
