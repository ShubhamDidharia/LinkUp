import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaEye, FaFlag } from "react-icons/fa";

const typeBadges = {
    post: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    comment: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    profileImage: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    coverImage: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    username: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
};

const ReportsQueue = () => {
    const [page, setPage] = useState(1);

    const { data: reports = [], isLoading, error } = useQuery({
        queryKey: ["pendingReports", page],
        queryFn: async () => {
            const res = await fetch(`/api/reports?page=${page}`);
            if (!res.ok) throw new Error("Failed to fetch reports");
            return res.json();
        },
        keepPreviousData: true
    });

    const handlePrev = () => setPage((old) => Math.max(old - 1, 1));
    const handleNext = () => setPage((old) => (reports.length === 20 ? old + 1 : old));

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="loading loading-spinner text-indigo-500 loading-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-400">
                Error loading reports: {error.message}
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Reports Queue
                    </h1>
                    <p className="text-slate-500 mt-2">Manage and resolve user-submitted policy infraction reports.</p>
                </div>
            </div>

            {/* List Table Card */}
            <div className="card bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 space-y-4">
                        <div className="p-4 bg-slate-850 rounded-full text-slate-600 border border-slate-800">
                            <FaFlag className="text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">All Clean!</h3>
                        <p className="text-slate-500">There are no pending user reports requiring attention.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-850/50 uppercase tracking-wider text-xs">
                                        <th className="p-4 font-bold">Reported User</th>
                                        <th className="p-4 font-bold">Reporter</th>
                                        <th className="p-4 font-bold">Type</th>
                                        <th className="p-4 font-bold">Reason</th>
                                        <th className="p-4 font-bold">Date</th>
                                        <th className="p-4 font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {reports.map((report) => (
                                        <tr key={report._id} className="hover:bg-slate-850/40 transition-colors duration-150">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={report.reportedUser?.profileImage || "/avatar-placeholder.png"} 
                                                        alt={report.reportedUser?.username} 
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-200 truncate">@{report.reportedUser?.username || "deleted_user"}</p>
                                                        <p className="text-xs text-slate-500 truncate">Strikes: {report.reportedUser?.strikes || 0}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={report.reportedBy?.profileImage || "/avatar-placeholder.png"} 
                                                        alt={report.reportedBy?.username} 
                                                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                                                    />
                                                    <span className="text-sm text-slate-400 font-medium">@{report.reportedBy?.username || "anonymous"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeBadges[report.reportType] || "bg-slate-800 text-slate-400"}`}>
                                                    {report.reportType}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300 max-w-xs truncate">
                                                {report.reason}
                                            </td>
                                            <td className="p-4 text-xs text-slate-500 font-semibold">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link 
                                                    to={`/admin/reports/${report._id}`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 transition-colors duration-200"
                                                >
                                                    <FaEye />
                                                    <span>Review</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-850/20">
                            <span className="text-sm text-slate-500 font-medium">Page {page}</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrev} 
                                    disabled={page === 1}
                                    className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors duration-150"
                                >
                                    <FaChevronLeft />
                                </button>
                                <button 
                                    onClick={handleNext} 
                                    disabled={reports.length < 20}
                                    className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors duration-150"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsQueue;
