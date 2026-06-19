"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Receipt,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Quotes", href: "/quotes", icon: FileText },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Employees", href: "/employees", icon: Briefcase },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#2563EB");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setBusinessName(data.businessName || "");
          setLogoUrl(data.logoUrl || "");
          setBrandColor(data.brandColor || "#2563EB");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandColor }}>
                <span className="text-white font-bold text-sm">CF</span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900 truncate">
              {businessName || "CleanFlow"}
            </span>
          </Link>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                style={isActive ? { backgroundColor: brandColor } : {}}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-8 h-8 rounded-full object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: brandColor }}>
                {businessName?.[0] || session?.user?.name?.[0] || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {businessName || session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}