import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { Search, LayoutDashboard, Briefcase, FileText, User, Users } from "lucide-react";
import { useUserProfile } from "../context/UserProfileContext";
import { api } from "../util/api";

const DashboardLayout = () => {
    const { profile, isRecruiter, isAdmin } = useUserProfile();
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
    };

    const navItems = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
        { to: "/dashboard/positions", label: "Positions", icon: Briefcase, show: true },
        { to: "/dashboard/cvs", label: "My CVs", icon: FileText, show: !isRecruiter && !isAdmin },
        { to: "/dashboard/profile", label: "Profile", icon: User, show: !isRecruiter },
        { to: "/dashboard/admin/users", label: "Admin", icon: Users, show: isAdmin },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                <div className="p-6 text-xl font-bold border-b border-slate-800">
                    CV Management
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems
                        .filter((item) => item.show)
                        .map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search positions or CVs..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                            />
                            <button
                                type="submit"
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg"
                                title="Search"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center gap-4">
                        {profile && (
                            <span className="text-sm text-gray-500 font-medium">
                                {profile.role}
                            </span>
                        )}
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;