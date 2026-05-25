import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FaUser, FaHistory, FaCheckCircle, FaTrashAlt, FaBan, FaExclamationTriangle, FaBrain } from "react-icons/fa";

const ReportDetail = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("posts");
    const [adminNote, setAdminNote] = useState("");
    const [generatingAI, setGeneratingAI] = useState(false);

    // Fetch report details
    const { data: report, isLoading, error } = useQuery({
        queryKey: ["reportDetail", reportId],
        queryFn: async () => {
            const res = await fetch(`/api/reports/${reportId}`);
            if (!res.ok) throw new Error("Failed to fetch report details");
            return res.json();
        }
    });

    const reportedUserId = report?.reportedUser?._id;

    // Fetch reported user's post history
    const { data: posts = [] } = useQuery({
        queryKey: ["reportedUserPosts", reportedUserId],
        queryFn: async () => {
            const res = await fetch(`/api/reports/user/${reportedUserId}/posts`);
            if (!res.ok) throw new Error("Failed to fetch posts");
            return res.json();
        },
        enabled: !!reportedUserId
    });

    // Fetch reported user's comment history
    const { data: comments = [] } = useQuery({
        queryKey: ["reportedUserComments", reportedUserId],
        queryFn: async () => {
            const res = await fetch(`/api/reports/user/${reportedUserId}/comments`);
            if (!res.ok) throw new Error("Failed to fetch comments");
            return res.json();
        },
        enabled: !!reportedUserId
    });

    // Resolve report mutation
    const resolveMutation = useMutation({
        mutationFn: async ({ action, adminNote }) => {
            const res = await fetch(`/api/reports/${reportId}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, adminNote })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to resolve report");
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Report resolved: ${data.action.toUpperCase()}`);
            queryClient.invalidateQueries(["pendingReports"]);
            navigate("/admin/reports");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    // AI Summary Mutation
    const generateAISummary = async () => {
        setGeneratingAI(true);
        try {
            const res = await fetch(`/api/reports/${reportId}/ai-summary`, {
                method: "POST"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate AI summary");
            
            toast.success("AI analysis completed");
            queryClient.invalidateQueries(["reportDetail", reportId]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setGeneratingAI(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="loading loading-spinner text-theme-purple loading-lg"></div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="p-8 text-center text-theme-coral">
                Error: {error?.message || "Report not found"}
            </div>
        );
    }

    const { reportedUser, reportedBy, reportType, reason, targetData, status, aiSummary } = report;

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold tracking-wider uppercase mb-1">
                    <Link to="/admin/reports" className="hover:text-white transition-colors">Reports Queue</Link>
                    <span>/</span>
                    <span className="text-theme-purple">Details</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Review Flagged Activity</h1>
                <p className="text-slate-500 mt-2">Investigate the flagged content, user status, and determine disciplinary actions.</p>
            </div>

            {/* Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Reported Content details */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="card bg-theme-dark/80 border border-theme-purple/20 shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-850 bg-slate-850/30 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-theme-coral/10 text-theme-coral rounded-lg"><FaExclamationTriangle className="text-xs" /></span>
                                Flagged Content
                            </h2>
                            <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-semibold uppercase">
                                {reportType}
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Target Content Previews based on Type */}
                            {reportType === "post" && targetData ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-850/50 border border-slate-800 rounded-xl space-y-3">
                                        <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{targetData.text}</p>
                                        {targetData.imageUrl && (
                                            <div className="relative group rounded-xl overflow-hidden max-h-80 border border-slate-800">
                                                <img 
                                                    src={targetData.imageUrl} 
                                                    alt="Reported Post" 
                                                    className="w-full object-cover rounded-xl"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {targetData.isNSFW && <span className="badge badge-warning font-semibold text-xs py-2">Manual NSFW</span>}
                                        {targetData.autoFlagged && <span className="badge badge-error font-semibold text-xs py-2">AI Auto-Flagged</span>}
                                    </div>
                                    {targetData.flagReasons && targetData.flagReasons.length > 0 && (
                                        <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Detection Flags</h4>
                                            <ul className="list-disc list-inside text-xs text-rose-300 space-y-1">
                                                {targetData.flagReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : reportType === "comment" && targetData ? (
                                <div className="p-4 bg-slate-850/50 border border-slate-800 rounded-xl space-y-3">
                                    <p className="text-slate-200 leading-relaxed text-sm">{targetData.text}</p>
                                    <p className="text-xs text-slate-500 font-semibold">
                                        Created: {new Date(targetData.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ) : reportType === "profileImage" ? (
                                <div className="flex flex-col items-center p-6 space-y-4">
                                    <img 
                                        src={reportedUser?.profileImage || "/avatar-placeholder.png"} 
                                        alt="Reported Avatar" 
                                        className="w-40 h-40 rounded-full object-cover border-4 border-slate-800 shadow-xl"
                                    />
                                    <p className="text-xs text-slate-500">Big Avatar Profile Preview</p>
                                </div>
                            ) : reportType === "coverImage" ? (
                                <div className="space-y-4">
                                    {reportedUser?.coverImage ? (
                                        <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-800">
                                            <img 
                                                src={reportedUser.coverImage} 
                                                alt="Reported Cover" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-600">
                                            No cover image set
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500 text-center">Banner Cover Preview</p>
                                </div>
                            ) : reportType === "username" ? (
                                <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl text-center">
                                    <p className="text-2xl font-black text-white">@{reportedUser?.username}</p>
                                    <p className="text-xs text-slate-500 mt-1">Username check request</p>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500">Flagged content has been deleted or is unavailable.</div>
                            )}

                            {/* Report Submitter Reason */}
                            <div className="border-t border-slate-850 pt-4 mt-4 space-y-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Details</h3>
                                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2">
                                        <img 
                                            src={reportedBy?.profileImage || "/avatar-placeholder.png"} 
                                            alt={reportedBy?.username} 
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                        <span className="text-xs font-bold text-slate-300">@{reportedBy?.username}</span>
                                        <span className="text-xs text-slate-500 font-medium">reported this:</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed italic">"{reason}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Reported User History */}
                <div className="lg:col-span-7 space-y-6">
                    {/* User Overview card */}
                    <div className="card bg-theme-dark/80 border border-theme-purple/20 shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-850 bg-slate-850/30 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-theme-purple/10 text-theme-purple rounded-lg"><FaUser className="text-xs" /></span>
                                User History & Profile
                            </h2>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                                reportedUser?.status === "suspended" 
                                    ? "bg-theme-coral/10 text-theme-coral border-theme-coral/20" 
                                    : reportedUser?.status === "under_review"
                                    ? "bg-theme-yellow/10 text-theme-yellow border-theme-yellow/20"
                                    : "bg-theme-purple/10 text-theme-purple border-theme-purple/20"
                            }`}>
                                {reportedUser?.status || "active"}
                            </span>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Header Stats */}
                            <div className="flex items-center gap-4">
                                <img 
                                    src={reportedUser?.profileImage || "/avatar-placeholder.png"} 
                                    alt={reportedUser?.username} 
                                    className="w-12 h-12 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                    <h3 className="font-extrabold text-white">@{reportedUser?.username}</h3>
                                    <p className="text-xs text-slate-500">System strikes: <strong className="text-red-400">{reportedUser?.strikes || 0}</strong></p>
                                </div>
                            </div>

                            {/* Tabs for user history list */}
                            <div className="tabs border-b border-slate-850">
                                <button 
                                    className={`tab tab-bordered font-bold pb-2 text-sm transition-colors ${activeTab === "posts" ? "tab-active text-indigo-400 border-indigo-400" : "text-slate-400 hover:text-slate-200"}`}
                                    onClick={() => setActiveTab("posts")}
                                >
                                    Posts ({posts.length})
                                </button>
                                <button 
                                    className={`tab tab-bordered font-bold pb-2 text-sm transition-colors ${activeTab === "comments" ? "tab-active text-indigo-400 border-indigo-400" : "text-slate-400 hover:text-slate-200"}`}
                                    onClick={() => setActiveTab("comments")}
                                >
                                    Comments ({comments.length})
                                </button>
                            </div>

                            {/* Tab Panels */}
                            <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                                {activeTab === "posts" ? (
                                    posts.length === 0 ? (
                                        <p className="text-slate-500 text-center text-sm py-8">No post history found</p>
                                    ) : (
                                        posts.map((post) => (
                                            <div key={post._id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                                                <div className="flex justify-between items-center text-xs text-slate-500">
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    <div className="flex gap-1">
                                                        {post.isNSFW && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] uppercase font-bold border border-amber-500/20">NSFW</span>}
                                                        {post.autoFlagged && <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded text-[10px] uppercase font-bold border border-rose-500/20">Auto-Flag</span>}
                                                    </div>
                                                </div>
                                                <p className="text-slate-350 text-xs leading-relaxed line-clamp-3">{post.text}</p>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    comments.length === 0 ? (
                                        <p className="text-slate-500 text-center text-sm py-8">No comment history found</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment._id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                                                <div className="flex justify-between items-center text-xs text-slate-500">
                                                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-slate-355 text-xs leading-relaxed line-clamp-3">{comment.text}</p>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gemini AI Summary panel */}
                    <div className="card bg-theme-dark/80 border border-theme-purple/20 shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-850 bg-slate-850/30 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-theme-pink/10 text-theme-pink rounded-lg"><FaBrain className="text-xs" /></span>
                                Gemini AI History Analysis
                            </h2>
                            <button
                                onClick={generateAISummary}
                                disabled={generatingAI}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-pink hover:bg-theme-pink/80 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-theme-pink/10"
                            >
                                {generatingAI ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <>
                                        <FaBrain />
                                        <span>Analyze Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-6">
                            {aiSummary ? (
                                <div className="p-4 bg-theme-pink/5 border border-theme-pink/10 rounded-xl space-y-2">
                                    <h4 className="text-xs font-bold text-theme-pink uppercase tracking-widest">Gemini Summary</h4>
                                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center text-sm py-4">No AI assessment generated. Click the button above to request analysis.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM: Action Resolution panel */}
            <div className="card bg-theme-dark/80 border border-theme-purple/20 shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-850 bg-slate-850/30">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="p-1.5 bg-theme-yellow/10 text-theme-yellow rounded-lg"><FaCheckCircle className="text-xs" /></span>
                        Resolve Report
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrator Resolution Note</label>
                        <textarea 
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Add reason, policy links, warnings to be issued..." 
                            className="textarea textarea-bordered bg-slate-950 border-slate-850 w-full text-slate-300 text-sm focus:border-theme-purple rounded-xl"
                            rows={3}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button 
                            onClick={() => resolveMutation.mutate({ action: "dismiss", adminNote })}
                            disabled={resolveMutation.isPending}
                            className="btn btn-outline border-slate-700 text-slate-300 hover:bg-slate-850 hover:text-white px-6 rounded-xl font-bold flex-1"
                        >
                            Dismiss Report
                        </button>
                        <button 
                            onClick={() => resolveMutation.mutate({ action: "warn", adminNote })}
                            disabled={resolveMutation.isPending}
                            className="btn bg-theme-yellow hover:bg-theme-yellow/80 text-white border-none px-6 rounded-xl font-bold flex-1"
                        >
                            Issue Warning (+1 Strike)
                        </button>
                        <button 
                            onClick={() => resolveMutation.mutate({ action: "delete_content", adminNote })}
                            disabled={resolveMutation.isPending}
                            className="btn bg-theme-coral hover:bg-theme-coral/80 text-white border-none px-6 rounded-xl font-bold flex-1"
                        >
                            <FaTrashAlt /> Delete Flagged Content
                        </button>
                        <button 
                            onClick={() => resolveMutation.mutate({ action: "suspend", adminNote })}
                            disabled={resolveMutation.isPending}
                            className="btn bg-theme-coral hover:bg-theme-coral/80 text-white border-none px-6 rounded-xl font-bold flex-1"
                        >
                            <FaBan /> Suspend User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetail;
