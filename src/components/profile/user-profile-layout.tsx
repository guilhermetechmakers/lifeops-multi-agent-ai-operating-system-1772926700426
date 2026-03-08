/**
 * User Profile layout: left rail nav, profile summary, and main content outlet.
 * 220–260px sidebar rhythm; full-width content on large viewports.
 */

import { Outlet } from "react-router-dom";
import { LeftRailNav } from "./left-rail-nav";
import { ProfileSummaryCard } from "./profile-summary-card";

const RAIL_WIDTH = 240;

export function UserProfileLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
      <aside
        className="w-full shrink-0 md:w-[240px]"
        style={{ minWidth: RAIL_WIDTH }}
        aria-label="Profile navigation"
      >
        <div className="sticky top-4 space-y-4">
          <ProfileSummaryCard />
          <LeftRailNav />
        </div>
      </aside>
      <main className="min-w-0 flex-1 animate-fade-in-up">
        <Outlet />
      </main>
    </div>
  );
}
