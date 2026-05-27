import { Link, NavLink, Outlet } from "react-router-dom";
import { Activity, Home, MonitorPlay, Radio, Trophy } from "lucide-react";
import { ChromeProvider, useAppChrome } from "../context/ChromeContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/host", label: "Host", icon: MonitorPlay },
  { to: "/player", label: "Player", icon: Radio },
  { to: "/results", label: "Results", icon: Trophy }
];

function ShellFrame() {
  const { navHidden } = useAppChrome();

  return (
    <div className="min-h-screen overflow-x-hidden bg-charcoal text-white">
      <div className="fixed inset-0 pointer-events-none opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(110,247,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(110,247,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-x-0 top-0 h-2/3 animate-scan bg-gradient-to-b from-transparent via-scrub/8 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,48,77,0.18),transparent_28%),radial-gradient(circle_at_88%_7%,rgba(36,245,199,0.16),transparent_26%)]" />
      </div>

      {!navHidden && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-charcoal/82 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-trauma/60 bg-trauma/10 shadow-alert">
                <Activity className="h-5 w-5 text-trauma" />
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-[0.18em]">Competency Stations</span>
            </Link>
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-md border px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] transition ${
                        isActive ? "border-scrub/50 bg-scrub/10 text-scrub" : "border-transparent text-white/55 hover:border-white/10 hover:text-white"
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
