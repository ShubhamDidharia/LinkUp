import { useState } from "react";
import { FaSearch, FaUser, FaUserTimes, FaUserCheck, FaExclamationTriangle, FaEnvelope } from "react-icons/fa";
import { toast } from "sonner";

const UserLookup = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setUser(null);
        try {
            const res = await fetch(`/api/users/profile/${searchQuery.trim()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "User not found");
            }
            setUser(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSearching(false);
        }
    };

    const handleAction = async (actionType) => {
        if (!user) return;
        setUpdating(true);

        try {
            const res = await fetch(`/api/reports/user/${user._id}/${actionType}`, {
                method: "POST"
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || `Failed to ${actionType} user`);
            }

            toast.success(`Action successful: User status is now ${data.user?.status || "updated"}`);
            setUser(data.user);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    User Lookup & Management
                </h1>
                <p className="text-slate-500 mt-2">Search user profiles, manage disciplinary strikes, and toggle account states.</p>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <FaSearch />
                    </span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by username (e.g. admin123, shubham)..." 
                        className="input input-bordered pl-10 bg-slate-900 border-slate-800 text-slate-100 text-sm focus:border-indigo-500 w-full rounded-xl py-6"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={searching}
                    className="btn bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white border-none px-8 rounded-xl font-bold flex items-center gap-2"
                >
                    {searching ? <span className="loading loading-spinner loading-xs"></span> : <FaSearch />}
                    <span>Lookup</span>
                </button>
            </form>

            {/* Profile Overview Card */}
            {user ? (
                <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden mt-6">
                    <div className="p-6 border-b border-slate-850 bg-slate-850/20 flex flex-wrap justify-between items-center gap-3">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><FaUser className="text-xs" /></span>
                            Account Overview
                        </h2>
                        <div className="flex gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                                user.status === "suspended" 
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                    : user.status === "under_review"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                                {user.status || "active"}
                            </span>
                            {user.role === "admin" && (
                                <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-bold uppercase">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4">
                            <img 
                                src={user.profileImage || "/avatar-placeholder.png"} 
                                alt={user.username} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-800 shadow-xl"
                            />
                            <div>
                                <h3 className="text-xl font-extrabold text-white">{user.fullName}</h3>
                                <p className="text-sm text-slate-500">@{user.username}</p>
                            </div>
                        </div>

                        {/* Profile Info Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 border border-slate-850/50 p-6 rounded-2xl">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 text-sm text-slate-400">
                                    <FaEnvelope className="text-indigo-400" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                    Member Since: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-850/80 pt-4 md:pt-0 md:pl-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Strikes History</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black text-red-500">{user.strikes || 0}</span>
                                    <span className="text-xs text-slate-500 font-medium">Strikes accumulated</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disciplinary Actions</h4>
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => handleAction("warn")}
                                    disabled={updating || user.role === "admin"}
                                    className="btn bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white border-none px-6 rounded-xl font-bold flex-1 flex items-center gap-2"
                                >
                                    <FaExclamationTriangle />
                                    <span>Warn (+1 Strike)</span>
                                </button>
                                <button 
                                    onClick={() => handleAction("suspend")}
                                    disabled={updating || user.role === "admin" || user.status === "suspended"}
                                    className="btn bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white border-none px-6 rounded-xl font-bold flex-1 flex items-center gap-2"
                                >
                                    <FaUserTimes />
                                    <span>Suspend Account</span>
                                </button>
                                <button 
                                    onClick={() => handleAction("unsuspend")}
                                    disabled={updating || user.role === "admin" || (user.status === "active" && user.strikes === 0)}
                                    className="btn bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white border-none px-6 rounded-xl font-bold flex-1 flex items-center gap-2"
                                >
                                    <FaUserCheck />
                                    <span>Reset & Unsuspend</span>
                                </button>
                            </div>
                            {user.role === "admin" && (
                                <p className="text-xs text-slate-500 italic mt-2">Disciplinary actions are disabled for admin profiles.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : searching ? (
                <div className="text-center py-12">
                    <span className="loading loading-spinner text-indigo-500 loading-md"></span>
                    <p className="text-slate-500 mt-2 text-sm">Searching user records...</p>
                </div>
            ) : (
                <div className="text-slate-500 text-center py-12 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                    Search for a username to view details and apply account restrictions.
                </div>
            )}
        </div>
    );
};

export default UserLookup;
