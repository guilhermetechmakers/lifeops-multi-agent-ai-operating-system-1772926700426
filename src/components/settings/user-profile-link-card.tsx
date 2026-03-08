/**
 * UserProfileLinkCard — Quick access to account management, security, API keys, billing.
 */

import { Link } from "react-router-dom";
import { User, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UserProfileLinkCard() {
  return (
    <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          User profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Account details, connected integrations, API keys, security (2FA), billing
        </p>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full sm:w-auto border-white/[0.03]" asChild>
          <Link to="/dashboard/profile">
            Open profile
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
