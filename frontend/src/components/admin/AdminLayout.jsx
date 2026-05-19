import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaHome, FaShieldAlt, FaUsers, FaArrowLeft, FaChartBar } from "react-icons/fa";
import ReportsQueue from "../../pages/admin/ReportsQueue";
import ReportDetail from "../../pages/admin/ReportDetail";
import UserLookup from "../../pages/admin/UserLookup";

// A simple nested Dashboard home page for statistics overview
const AdminDashboard = () => {
    const { data: reports = [] } = useQuery({
        queryKey: ["adminReportsOverview"],
        queryFn: async () => {
            const res = await fetch("/api/reports");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const pendingCount = reports.filter(r => r.status === "pending").length;

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-slate-500 mt-2">Welcome to the Moderation Admin Panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl hover:scale-[1.02] transition-transform duration-200">
                    <div className="card-body">
                        <h2 className="card-title text-indigo-100 uppercase tracking-wider text-sm font-semibold">Pending Reports</h2>
                        <p className="text-5xl font-black mt-2">{reports.length}</p>
                        <p className="text-indigo-200 text-sm mt-4">Needs immediate administrator review</p>
                    </div>
                </div>

                <div className="card bg-slate-800 text-white shadow-xl border border-slate-700 hover:scale-[1.02] transition-transform duration-200">
                    <div className="card-body">
                        <h2 className="card-title text-slate-400 uppercase tracking-wider text-sm font-semibold">Active Warnings</h2>
                        <p className="text-5xl font-black mt-2 text-yellow-400">Enabled</p>
                        <p className="text-slate-400 text-sm mt-4">Automated content policy protection</p>
                    </div>
                </div>

                <div className="card bg-slate-800 text-white shadow-xl border border-slate-700 hover:scale-[1.02] transition-transform duration-200">
                    <div className="card-body">
                        <h2 className="card-title text-slate-400 uppercase tracking-wider text-sm font-semibold">Moderation Engine</h2>
                        <p className="text-5xl font-black mt-2 text-emerald-400">Active</p>
                        <p className="text-slate-400 text-sm mt-4">Google Vision & bad-words live checks</p>
                    </div>
                </div>
            </div>

            <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-850">
                    <h2 className="text-xl font-bold text-slate-200">System Overview</h2>
                </div>
                <div className="p-6 text-slate-400 leading-relaxed space-y-4">
                    <p>
                        The Moderation System performs real-time text and visual validation whenever post and profile updates occur.
                    </p>
                    <p>
                        Use the <strong>Reports Queue</strong> to investigate user-flagged infractions, resolve with warnings or suspensions, and request Gemini AI analysis of their historical violation patterns.
                    </p>
                </div>
            </div>
        </div>
    );
};

const AdminLayout = () => {
    const location = useLocation();
    
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    // Helper for active styling
    const linkClass = (path) => {
        const isActive = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
        return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
            isActive 
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }`;
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                            <FaShieldAlt className="text-xl" />
                        </div>
                        <div>
                            <h2 className="font-extrabold tracking-wider text-white text-lg">Admin Panel</h2>
                            <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase">LinkUp</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <Link to="/admin" className={linkClass("/admin")}>
                            <FaChartBar className="text-lg" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/admin/reports" className={linkClass("/admin/reports")}>
                            <FaShieldAlt className="text-lg" />
                            <span>Reports Queue</span>
                        </Link>
                        <Link to="/admin/users" className={linkClass("/admin/users")}>
                            <FaUsers className="text-lg" />
                            <span>User Lookup</span>
                        </Link>
                    </nav>
                </div>

                {/* Footer Admin Details */}
                <div className="p-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={authUser?.profileImage || "/avatar-placeholder.png"} 
                            alt={authUser?.username} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{authUser?.fullName || "Admin"}</p>
                            <p className="text-xs text-slate-500 truncate">@{authUser?.username}</p>
                        </div>
                    </div>

                    <Link to="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors duration-200">
                        <FaArrowLeft />
                        <span>Return to Main App</span>
                    </Link>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 bg-slate-950 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/reports" element={<ReportsQueue />} />
                    <Route path="/reports/:reportId" element={<ReportDetail />} />
                    <Route path="/users" element={<UserLookup />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminLayout;
