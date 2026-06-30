import { Outlet, NavLink } from "react-router";
import { Building2, AlertTriangle, Package, LayoutDashboard, ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import logo from "figma:asset/d2c40cb1bbe2ef97d769ae605a9e404ceb22c489.png";
import { useSite } from "../context/SiteContext";

const sites = [
  "Nutrien Allan",
  "Nutrien Lanigan",
  "Nutrien Cory",
  "Nutrien Rocanville",
  "Mosaic Esterhazy",
];

export function RootLayout() {
  const { selectedSite, setSelectedSite } = useSite();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="size-full flex flex-col bg-slate-50">
      <header style={{ backgroundColor: "#5f352e" }} className="shadow-lg">
        <div className="px-6 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="SmartDome Logo" className="w-11 h-11 object-contain drop-shadow-md" />
              <div>
                <h1 className="text-white tracking-wide" style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.2 }}>
                  SmartDome
                </h1>
                <p className="text-white/70" style={{ fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                  Efficiency at our potash storage barns
                </p>
              </div>
            </div>

            {/* Site Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md text-sm transition-all text-white hover:bg-white/15 border border-white/20"
              >
                <MapPin className="w-3.5 h-3.5 text-white/70" />
                <span className="font-medium">{selectedSite}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {sites.map((site) => (
                    <button
                      key={site}
                      onClick={() => {
                        setSelectedSite(site);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition-colors text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: selectedSite === site ? "#5f352e" : "transparent",
                        color: selectedSite === site ? "white" : "#3f3f46",
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                      {site}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex gap-0.5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all rounded-t-md border-b-2 ${
                  isActive
                    ? "bg-white/15 text-white border-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white border-transparent"
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </NavLink>
            <NavLink
              to="/structural"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all rounded-t-md border-b-2 ${
                  isActive
                    ? "bg-white/15 text-white border-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white border-transparent"
                }`
              }
            >
              <Building2 className="w-3.5 h-3.5" />
              Structural Monitoring
            </NavLink>
            <NavLink
              to="/foreign-material"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all rounded-t-md border-b-2 ${
                  isActive
                    ? "bg-white/15 text-white border-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white border-transparent"
                }`
              }
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Foreign Material Detection
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all rounded-t-md border-b-2 ${
                  isActive
                    ? "bg-white/15 text-white border-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white border-transparent"
                }`
              }
            >
              <Package className="w-3.5 h-3.5" />
              Inventory Monitoring
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
