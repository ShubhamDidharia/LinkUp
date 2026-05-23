import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    FaShieldAlt, 
    FaUsers, 
    FaArrowLeft, 
    FaChartBar, 
    FaServer, 
    FaDatabase, 
    FaCloud, 
    FaBrain, 
    FaSync, 
    FaTrashAlt, 
    FaPlus, 
    FaCog, 
    FaHistory, 
    FaFileAlt,
    FaUserShield,
    FaExclamationCircle,
    FaCheckCircle,
    FaShieldVirus
} from "react-icons/fa";
import SecurityAlerts from "../../pages/admin/SecurityAlerts";
import UsersAtRisk from "../../pages/admin/UsersAtRisk";
import { toast } from "sonner";
import ReportsQueue from "../../pages/admin/ReportsQueue";
import ReportDetail from "../../pages/admin/ReportDetail";
import UserLookup from "../../pages/admin/UserLookup";

// The expanded AdminDashboard Home Sub-component
const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const [newWord, setNewWord] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    // Local state for settings form
    const [bannedWords, setBannedWords] = useState([]);
    const [strikeLimitReview, setStrikeLimitReview] = useState(3);
    const [strikeLimitSuspend, setStrikeLimitSuspend] = useState(5);
    const [imageModerationEnabled, setImageModerationEnabled] = useState(true);
    const [textModerationEnabled, setTextModerationEnabled] = useState(true);

    // 1. Fetch Dynamic Statistics
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        }
    });

    // 2. Fetch System Health Status
    const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
        queryKey: ["adminHealth"],
        queryFn: async () => {
            const res = await fetch("/api/admin/health");
            if (!res.ok) throw new Error("Failed to fetch health data");
            return res.json();
        }
    });

    // 3. Fetch Moderation Settings
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ["adminSettings"],
        queryFn: async () => {
            const res = await fetch("/api/admin/settings");
            if (!res.ok) throw new Error("Failed to fetch settings");
            return res.json();
        }
    });

    // 4. Fetch System Audit Log Activity
    const { data: auditLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
        queryKey: ["adminAuditLogs"],
        queryFn: async () => {
            const res = await fetch("/api/admin/activity");
            if (!res.ok) throw new Error("Failed to fetch audit logs");
            return res.json();
        }
    });

    // Sync settings states when loaded
    useEffect(() => {
        if (settings) {
            setBannedWords(settings.bannedWords || []);
            setStrikeLimitReview(settings.strikeLimitReview || 3);
            setStrikeLimitSuspend(settings.strikeLimitSuspend || 5);
            setImageModerationEnabled(settings.imageModerationEnabled !== false);
            setTextModerationEnabled(settings.textModerationEnabled !== false);
        }
    }, [settings]);

    // Mutation: Update Settings
    const updateSettingsMutation = useMutation({
        mutationFn: async (updatedData) => {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
            if (!res.ok) throw new Error("Failed to save settings");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Moderation settings updated successfully");
            queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update settings");
        }
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateSettingsMutation.mutate({
            bannedWords,
            strikeLimitReview: Number(strikeLimitReview),
            strikeLimitSuspend: Number(strikeLimitSuspend),
            imageModerationEnabled,
            textModerationEnabled
        });
    };

    const handleAddWord = (e) => {
        e.preventDefault();
        const trimmed = newWord.trim().toLowerCase();
        if (!trimmed) return;
        if (bannedWords.includes(trimmed)) {
            toast.error("Word already exists in blocked list");
            return;
        }
        setBannedWords([...bannedWords, trimmed]);
        setNewWord("");
    };

    const handleRemoveWord = (wordToRemove) => {
        setBannedWords(bannedWords.filter(w => w !== wordToRemove));
    };

    const triggerRefreshAll = () => {
        refetchStats();
        refetchHealth();
        refetchLogs();
        toast.success("Dashboard metrics synced successfully");
    };

    const isPageLoading = statsLoading || healthLoading || settingsLoading || logsLoading;

    if (isPageLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-indigo-500"></span>
                    <p className="text-slate-400 font-medium">Gathering command center analytics...</p>
                </div>
            </div>
        );
    }

    // Chart Point Calculator
    const trendList = stats?.trend || [];
    const maxCount = Math.max(...trendList.map(t => t.count), 5);
    const width = 500;
    const height = 140;
    const points = trendList.map((t, idx) => {
        const x = (idx / 6) * width;
        const y = height - (t.count / maxCount) * (height - 30) - 15;
        return `${x},${y}`;
    }).join(" ");

    // Report Type Statistics Percentage Calculator
    const rTypes = stats?.reportTypes || { post: 0, comment: 0, profileImage: 0, coverImage: 0, username: 0 };
    const totalTypeReports = Object.values(rTypes).reduce((a, b) => a + b, 0) || 1;

    return (
        <div className="p-8 space-y-8 animate-fade-in text-slate-100">
            {/* Header Area */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-900 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Admin Command Center
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">
                        System health status monitoring, safety policies configurations, and moderation audits.
                    </p>
                </div>
                <button 
                    onClick={triggerRefreshAll}
                    className="btn bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:border-slate-700 transition-all cursor-pointer"
                >
                    <FaSync className="text-xs" />
                    <span>Sync Dashboard</span>
                </button>
            </div>

            {/* Main Tabs Selection Navigation */}
            <div className="tabs tabs-boxed bg-slate-900/60 p-1 border border-slate-850 max-w-lg rounded-xl flex">
                <button 
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all cursor-pointer ${
                        activeTab === "overview" 
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <FaChartBar className="text-xs" />
                    <span>Stats & Charts</span>
                </button>
                <button 
                    onClick={() => setActiveTab("settings")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all cursor-pointer ${
                        activeTab === "settings" 
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <FaCog className="text-xs" />
                    <span>Moderation Settings</span>
                </button>
                <button 
                    onClick={() => setActiveTab("logs")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all cursor-pointer ${
                        activeTab === "logs" 
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <FaHistory className="text-xs" />
                    <span>Audit Logs</span>
                </button>
            </div>

            {/* TAB: OVERVIEW STATS & CHARTS */}
            {activeTab === "overview" && (
                <div className="space-y-8 animate-fade-in">
                    {/* Top Level Metric Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Reports Status Card */}
                        <div className="card bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-900/40 shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200">
                            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                Pending Reports
                            </h2>
                            <p className="text-5xl font-black mt-3 text-white tracking-tight">{stats?.reports?.pending || 0}</p>
                            <div className="mt-4 text-xs text-slate-500 flex justify-between">
                                <span>Total: {stats?.reports?.total || 0}</span>
                                <span>Resolved: {(stats?.reports?.actioned || 0) + (stats?.reports?.dismissed || 0)}</span>
                            </div>
                        </div>

                        {/* Accounts Suspended Card (clickable -> Users At Risk) */}
                        <Link to="/admin/users-at-risk" className="block">
                            <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200 hover:border-indigo-600/30">
                                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <FaUsers className="text-indigo-400 text-sm" />
                                    Users Overview
                                </h2>
                                <p className="text-5xl font-black mt-3 text-white tracking-tight">{stats?.users?.total || 0}</p>
                                <div className="mt-4 text-xs text-slate-500 flex gap-3">
                                    <span className="text-rose-400">Suspended: {stats?.users?.suspended || 0}</span>
                                    <span className="text-amber-400">Review: {stats?.users?.underReview || 0}</span>
                                </div>
                            </div>
                        </Link>

                        {/* Content Moderation Flagged Card */}
                        <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200">
                            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <FaFileAlt className="text-indigo-400 text-sm" />
                                Content Flags
                            </h2>
                            <p className="text-5xl font-black mt-3 text-amber-500 tracking-tight">{stats?.posts?.autoFlagged || 0}</p>
                            <div className="mt-4 text-xs text-slate-500 flex justify-between">
                                <span>Total Posts: {stats?.posts?.total || 0}</span>
                                <span className="text-rose-400">NSFW Tagged: {stats?.posts?.nsfw || 0}</span>
                            </div>
                        </div>

                        {/* Active Sessions count Card */}
                        <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200">
                            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                Users Live Online
                            </h2>
                            <p className="text-5xl font-black mt-3 text-emerald-400 tracking-tight">{health?.activeSocketSessions || 0}</p>
                            <div className="mt-4 text-xs text-slate-500">
                                Real-time active socket client integrations.
                            </div>
                        </div>
                    </div>

                    {/* Chart Visualization Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 7 Days Report Trend SVG Chart */}
                        <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white text-lg">7-Day Violation Reports Trend</h3>
                                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold">
                                    Last Week
                                </span>
                            </div>
                            
                            <div className="w-full h-36 flex items-end">
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Grid Lines */}
                                    <line x1="0" y1={height - 15} x2={width} y2={height - 15} stroke="#1e293b" strokeWidth="1" />
                                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                                    <line x1="0" y1="15" x2={width} y2="15" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                                    
                                    {/* Area Fill */}
                                    <path 
                                        d={`M 0,${height - 15} L ${points} L ${width},${height - 15} Z`} 
                                        fill="url(#gradient)" 
                                    />
                                    
                                    {/* Area Polyline Line */}
                                    <polyline 
                                        fill="none" 
                                        stroke="#6366f1" 
                                        strokeWidth="3.5" 
                                        points={points} 
                                    />
                                    
                                    {/* Circles on Nodes */}
                                    {trendList.map((t, idx) => {
                                        const x = (idx / 6) * width;
                                        const y = height - (t.count / maxCount) * (height - 30) - 15;
                                        return (
                                            <g key={idx} className="group cursor-pointer">
                                                <circle 
                                                    cx={x} 
                                                    cy={y} 
                                                    r="5" 
                                                    fill="#6366f1" 
                                                    stroke="#0f172a" 
                                                    strokeWidth="2.5" 
                                                    className="transition-all duration-200 hover:r-7"
                                                />
                                                <title>{`${t.date}: ${t.count} reports`}</title>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* X Axis Dates Labels */}
                            <div className="flex justify-between mt-3 text-xs text-slate-500 font-semibold px-1">
                                {trendList.map((t, idx) => {
                                    const dateObj = new Date(t.date);
                                    const label = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                                    return <span key={idx}>{label}</span>;
                                })}
                            </div>
                        </div>

                        {/* Report Category breakdown visual list */}
                        <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6">
                            <h3 className="font-bold text-white text-lg mb-6">Report Category Distribution</h3>
                            
                            <div className="space-y-4">
                                {/* Post reports bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                                        <span>Post Violations</span>
                                        <span>{rTypes.post} reports ({(rTypes.post / totalTypeReports * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(rTypes.post / totalTypeReports * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Comment reports bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                                        <span>Comment Profanity / Slurs</span>
                                        <span>{rTypes.comment} reports ({(rTypes.comment / totalTypeReports * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-violet-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(rTypes.comment / totalTypeReports * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Profiles image reports bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                                        <span>Inappropriate Profile Photos</span>
                                        <span>{rTypes.profileImage} reports ({(rTypes.profileImage / totalTypeReports * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(rTypes.profileImage / totalTypeReports * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Username/Cover reports combined */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                                        <span>Usernames & Cover Photos</span>
                                        <span>{rTypes.username + rTypes.coverImage} reports ({((rTypes.username + rTypes.coverImage) / totalTypeReports * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${((rTypes.username + rTypes.coverImage) / totalTypeReports * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Health Status Panel */}
                    <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6">
                        <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                            <FaServer className="text-indigo-400" />
                            System Health & Infrastructure Diagnostics
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* MongoDB Connection Status */}
                            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex items-center justify-between">
                                <div className="flex items-center gap-4.5">
                                    <div className="p-3 bg-slate-900 rounded-xl text-emerald-400 border border-slate-800">
                                        <FaDatabase className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-white">MongoDB Connection</p>
                                        <p className="text-xs text-slate-500">Mongoose Session State</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                                    health?.mongoStatus === "connected" 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}>
                                    {health?.mongoStatus === "connected" ? <FaCheckCircle className="text-xs" /> : <FaExclamationCircle className="text-xs" />}
                                    <span>{health?.mongoStatus}</span>
                                </span>
                            </div>

                            {/* Cloudinary Integration Status */}
                            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex items-center justify-between">
                                <div className="flex items-center gap-4.5">
                                    <div className="p-3 bg-slate-900 rounded-xl text-cyan-400 border border-slate-800">
                                        <FaCloud className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-white">Cloudinary CDN</p>
                                        <p className="text-xs text-slate-500">Media Moderation Engine</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                                    health?.cloudinaryStatus === "connected" 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}>
                                    {health?.cloudinaryStatus === "connected" ? <FaCheckCircle className="text-xs" /> : <FaExclamationCircle className="text-xs" />}
                                    <span>{health?.cloudinaryStatus}</span>
                                </span>
                            </div>

                            {/* Gemini AI API Key Status */}
                            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex items-center justify-between">
                                <div className="flex items-center gap-4.5">
                                    <div className="p-3 bg-slate-900 rounded-xl text-violet-400 border border-slate-800">
                                        <FaBrain className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-white">Google Gemini AI</p>
                                        <p className="text-xs text-slate-500">Generative Summaries</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                                    health?.geminiStatus === "connected" 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}>
                                    {health?.geminiStatus === "connected" ? <FaCheckCircle className="text-xs" /> : <FaExclamationCircle className="text-xs" />}
                                    <span>{health?.geminiStatus}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: MODERATION SETTINGS CONFIGURATION */}
            {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Settings Left Column: Controls & Thresholds */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 space-y-6">
                                <h3 className="font-bold text-white text-lg border-b border-slate-850 pb-3 flex items-center gap-2">
                                    <FaCog className="text-indigo-400" />
                                    Global Moderation Toggles
                                </h3>

                                {/* Profanity check toggle */}
                                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
                                    <div>
                                        <p className="font-extrabold text-sm text-white">Text Profanity Filtering</p>
                                        <p className="text-xs text-slate-500">Scan user comments, bio details, and posts using bad-words list.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={textModerationEnabled}
                                        onChange={(e) => setTextModerationEnabled(e.target.checked)}
                                        className="toggle toggle-indigo" 
                                    />
                                </div>

                                {/* Image check toggle */}
                                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
                                    <div>
                                        <p className="font-extrabold text-sm text-white">Visual Image Moderation</p>
                                        <p className="text-xs text-slate-500">Moderate upload media automatically through API detection filters.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={imageModerationEnabled}
                                        onChange={(e) => setImageModerationEnabled(e.target.checked)}
                                        className="toggle toggle-indigo" 
                                    />
                                </div>
                            </div>

                            <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 space-y-6">
                                <h3 className="font-bold text-white text-lg border-b border-slate-850 pb-3 flex items-center gap-2">
                                    <FaUserShield className="text-indigo-400" />
                                    Automated Discipline Thresholds
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Warning Review Limit */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Under Review Strike Threshold
                                        </label>
                                        <input 
                                            type="number" 
                                            value={strikeLimitReview}
                                            onChange={(e) => setStrikeLimitReview(e.target.value)}
                                            min="1"
                                            max="10"
                                            className="input input-bordered w-full bg-slate-950 border-slate-850 text-slate-100 rounded-xl focus:border-indigo-500" 
                                        />
                                        <p className="text-[11px] text-slate-500">Accumulating this count marks the account status as "under_review".</p>
                                    </div>

                                    {/* Suspension Limit */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Suspension Strike Threshold
                                        </label>
                                        <input 
                                            type="number" 
                                            value={strikeLimitSuspend}
                                            onChange={(e) => setStrikeLimitSuspend(e.target.value)}
                                            min="1"
                                            max="20"
                                            className="input input-bordered w-full bg-slate-950 border-slate-850 text-slate-100 rounded-xl focus:border-indigo-500" 
                                        />
                                        <p className="text-[11px] text-slate-500">Hitting this count immediately locks out user and suspends access.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Right Column: Forbidden Words List */}
                        <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 space-y-6">
                            <h3 className="font-bold text-white text-lg border-b border-slate-850 pb-3 flex items-center gap-2">
                                <FaTrashAlt className="text-rose-400" />
                                Custom Forbidden Words
                            </h3>
                            
                            {/* Word Add bar */}
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newWord}
                                    onChange={(e) => setNewWord(e.target.value)}
                                    placeholder="Add bad word..." 
                                    className="input input-sm input-bordered flex-1 bg-slate-950 border-slate-850 text-slate-100 rounded-xl"
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddWord}
                                    className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none font-bold"
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            {/* Tags list display */}
                            <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-850/50">
                                {bannedWords.length > 0 ? (
                                    bannedWords.map((word, index) => (
                                        <span 
                                            key={index} 
                                            className="badge bg-slate-900 border border-slate-800 text-slate-300 font-medium py-2.5 px-3 rounded-lg flex items-center gap-1.5 text-[11px]"
                                        >
                                            <span>{word}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveWord(word)}
                                                className="text-slate-500 hover:text-rose-400 cursor-pointer"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-600 p-2 italic w-full text-center">No custom blocked words added.</span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Input words check exact profanity blocks dynamically. Removing defaults allows specific words.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Save settings action button */}
                    <div className="flex justify-end pt-4 border-t border-slate-900">
                        <button 
                            type="submit" 
                            disabled={updateSettingsMutation.isPending}
                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 rounded-xl border-none shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                        >
                            {updateSettingsMutation.isPending ? "Saving configuration..." : "Save Policy Config"}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB: SYSTEM AUDIT LOGS */}
            {activeTab === "logs" && (
                <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <FaHistory className="text-indigo-400" />
                            Incident Resolution Audit Feed
                        </h3>
                        <span className="text-xs text-slate-500 font-semibold uppercase">
                            Recent Actioned/Dismissed Events
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {auditLogs && auditLogs.length > 0 ? (
                            auditLogs.map((log, index) => {
                                const isAction = log.status === "actioned";
                                return (
                                    <div 
                                        key={index}
                                        className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col md:flex-row justify-between gap-4"
                                    >
                                        <div className="space-y-2">
                                            {/* Top info row */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                                    isAction 
                                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                }`}>
                                                    {log.status === "actioned" ? "Actioned" : "Dismissed"}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Type: <strong className="text-slate-300 font-bold">{log.reportType}</strong>
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    &bull; Reported user: <strong className="text-slate-300">@{log.reportedUser?.username || "deleted"}</strong>
                                                </span>
                                            </div>

                                            {/* Report Details and Admin reasons */}
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-300">
                                                    <span className="text-slate-500">Reason reported:</span> {log.reason}
                                                </p>
                                                {log.adminNote && (
                                                    <p className="text-xs text-slate-400 bg-slate-900 border border-slate-850 p-2.5 rounded-lg italic">
                                                        <span className="text-indigo-400 font-bold not-italic">Admin Action Note:</span> "{log.adminNote}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Resolution Details */}
                                        <div className="flex items-start md:items-end flex-col justify-between text-left md:text-right shrink-0 border-t md:border-t-0 border-slate-850 pt-3 md:pt-0">
                                            <div className="flex items-center gap-2">
                                                <img 
                                                    src={log.resolvedBy?.profileImage || "/avatar-placeholder.png"} 
                                                    alt={log.resolvedBy?.username} 
                                                    className="w-5.5 h-5.5 rounded-full object-cover border border-slate-700"
                                                />
                                                <span className="text-xs text-slate-400 font-bold">
                                                    Resolved by @{log.resolvedBy?.username || "admin"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-1">
                                                {new Date(log.resolvedAt || log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-slate-500 italic text-sm">
                                No incident audit logs recorded yet. Action or dismiss reports in queue.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminLayout = () => {
    const location = useLocation();
    
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

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
                        <Link to="/admin/security" className={linkClass("/admin/security")}>
                            <FaShieldVirus className="text-lg" />
                            <span>Security Alerts</span>
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
                    <Route path="/users-at-risk" element={<UsersAtRisk />} />
                    <Route path="/security" element={<SecurityAlerts />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminLayout;
