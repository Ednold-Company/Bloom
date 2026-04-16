import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bloom-gradient min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-6xl gap-6">
        <Sidebar />
        <div className="flex-1 space-y-6">
          <div className="sticky top-4 z-50 md:hidden">
            <MobileNav />
          </div>
          <Topbar />
          {children}
        </div>
      </div>
    </div>
  );
}
