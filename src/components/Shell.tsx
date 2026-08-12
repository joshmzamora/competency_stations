import { Link, NavLink, Outlet } from "react-router-dom";
import { Activity, Home, MonitorPlay, Radio } from "lucide-react";
import { ChromeProvider, useAppChrome } from "../context/ChromeContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/host", label: "Host", icon: MonitorPlay },
  { to: "/player", label: "Player", icon: Radio }
];

function ShellFrame() {
  const { navHidden } = useAppChrome();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-charcoal text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-gradient-to-b from-white/[0.025] to-transparent" />

      {!navHidden && (
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-charcoal/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-6">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md border border-trauma/35 bg-trauma/[0.07]">
                <Activity className="h-4.5 w-4.5 text-trauma" />
              </span>
              <span className="font-display text-base font-bold tracking-[0.08em] text-white/95 md:text-lg">Competency Stations</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                        isActive ? "bg-white/[0.07] text-white" : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </header>
      )}

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

export function Shell() {
  return (
    <ChromeProvider>
      <ShellFrame />
    </ChromeProvider>
  );
}
