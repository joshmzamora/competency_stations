import { Link, NavLink, Outlet } from "react-router-dom";
import { Activity, Home, MonitorPlay, Radio, UserRound } from "lucide-react";
import { ChromeProvider, useAppChrome } from "../context/ChromeContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/host", label: "Host", icon: MonitorPlay },
  { to: "/player", label: "Player", icon: Radio },
  { to: "/solo", label: "Solo", icon: UserRound }
];

function ShellFrame() {
  const { navHidden } = useAppChrome();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-charcoal text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-gradient-to-b from-white/[0.025] to-transparent" />

      {!navHidden && (
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-charcoal/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-5 md:px-6 md:py-3">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-md border border-trauma/35 bg-trauma/[0.07]">
                <Activity className="h-[18px] w-[18px] text-trauma" />
              </span>
              <span className="truncate font-display text-base font-bold tracking-[0.05em] text-white/95 md:text-lg">Competency Stations</span>
            </Link>

            <nav className="hidden items-center gap-5 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 border-b-2 px-0.5 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-scrub text-white"
                          : "border-transparent text-white/42 hover:border-white/15 hover:text-white/75"
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

          <nav className="grid grid-cols-4 border-t border-white/[0.06] px-2 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center justify-center gap-1.5 border-b-2 px-1 text-[12px] font-medium transition ${
                      isActive ? "border-scrub text-white" : "border-transparent text-white/42"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
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
