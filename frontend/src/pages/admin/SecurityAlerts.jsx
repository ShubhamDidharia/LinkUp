import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FaShieldVirus, FaRobot, FaUser, FaTrashAlt,
    FaBrain, FaTimes, FaExclamationTriangle, FaUserTimes,
    FaSync, FaNetworkWired
} from "react-icons/fa";
import { toast } from "sonner";

// ── AI Analysis Modal ──────────────────────────────────────────────────────────
const AiModal = ({ violation, onClose }) => {
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);
    const [ran, setRan] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/rate-limit-violations/${violation._id}/ai-analyze`, {
                method: "POST"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "AI analysis failed");
            setAnalysis(data.aiAnalysis);
            setRan(true);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Colorise VERDICT line
    const renderAnalysis = (text) => {
        return text.split("\n").map((line, i) => {
            const verdictColor =
                line.includes("BOT") ? "text-rose-400" :
                line.includes("SUSPICIOUS") ? "text-amber-400" :
                line.includes("AUTHENTIC") ? "text-emerald-400" : "text-slate-300";
            return (
                <p key={i} className={`text-sm leading-relaxed ${line.startsWith("1.") ? `font-extrabold text-base ${verdictColor}` : "text-slate-300"}`}>
                    {line || <br />}
                </p>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                            <FaBrain />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white">Gemini AI Bot Detection</h3>
                            <p className="text-xs text-slate-500">IP: {violation.ip} · {violation.endpoint}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Incident summary */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Incident Summary</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <span className="text-slate-400">Endpoint</span>
                            <span className="text-slate-200 font-mono">{violation.endpoint}</span>
                            <span className="text-slate-400">Trigger count</span>
                            <span className="text-slate-200">{violation.violationCount}</span>
                            <span className="text-slate-400">Attempted user</span>
                            <span className="text-slate-200">{violation.attemptedUsername || "—"}</span>
                            <span className="text-slate-400">Linked account</span>
                            <span className="text-slate-200">
                                {violation.user ? `@${violation.user.username}` : "Anonymous"}
                            </span>
                            <span className="text-slate-400">Time</span>
                            <span className="text-slate-200">{new Date(violation.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* AI result area */}
                    {ran ? (
                        <div className="bg-slate-950 border border-violet-800/30 rounded-xl p-4 space-y-2 max-h-60 overflow-y-auto">
                            {renderAnalysis(analysis)}
                        </div>
                    ) : (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm italic">
                            Click the button below to run Gemini AI analysis on this incident.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-800 flex justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="btn bg-slate-800 hover:bg-slate-700 border-none text-slate-300 rounded-xl px-5 cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className="btn bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 border-none text-white font-bold rounded-xl px-6 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <><span className="loading loading-spinner loading-xs"></span> Analyzing…</>
                        ) : (
                            <><FaBrain /> {ran ? "Re-run Analysis" : "Run Gemini AI Analysis"}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Severity badge helper ──────────────────────────────────────────────────────
const endpointSeverity = (endpoint) => {
    if (endpoint.includes("login") || endpoint.includes("signup"))
        return { label: "Auth Attack", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    if (endpoint.includes("posts"))
        return { label: "Spam", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    if (endpoint.includes("reports"))
        return { label: "Report Flood", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
    return { label: "General", cls: "bg-slate-700/30 text-slate-400 border-slate-700" };
};

// ── Main SecurityAlerts component ─────────────────────────────────────────────
const SecurityAlerts = () => {
    const queryClient = useQueryClient();
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [aiModalOpen, setAiModalOpen] = useState(false);

    const { data: violations = [], isLoading, refetch } = useQuery({
        queryKey: ["rateLimitViolations"],
        queryFn: async () => {
            const res = await fetch("/api/admin/rate-limit-violations");
            if (!res.ok) throw new Error("Failed to fetch violations");
            return res.json();
        }
    });

    // Dismiss mutation
    const dismissMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/admin/rate-limit-violations/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to dismiss");
        },
        onSuccess: () => {
            toast.success("Alert dismissed");
            queryClient.invalidateQueries({ queryKey: ["rateLimitViolations"] });
        },
        onError: (err) => toast.error(err.message)
    });

    // Quick warn / suspend mutation (reuses existing report route)
    const quickActionMutation = useMutation({
        mutationFn: async ({ userId, action }) => {
            const res = await fetch(`/api/reports/user/${userId}/${action}`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Failed to ${action}`);
            return data;
        },
        onSuccess: (_, { action }) => toast.success(`User ${action}ed successfully`),
        onError: (err) => toast.error(err.message)
    });

    const openAiModal = (v) => {
        setSelectedViolation(v);
        setAiModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-24">
                <span className="loading loading-spinner loading-md text-indigo-500"></span>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-900 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                        Security Alerts
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Rate-limit violations logged in real time. Run Gemini AI to classify bots vs. authentic users.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${violations.length > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                        {violations.length > 0 ? `${violations.length} Active Alerts` : "All Clear"}
                    </span>
                    <button
                        onClick={() => refetch()}
                        className="btn btn-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                        <FaSync className="text-xs" /> Refresh
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {violations.length === 0 && (
                <div className="text-center py-20 text-slate-500 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                    <FaShieldVirus className="text-4xl mx-auto mb-4 text-emerald-500/40" />
                    <p className="font-semibold text-slate-400">No rate-limit violations detected.</p>
                    <p className="text-sm mt-1">The system is operating normally.</p>
                </div>
            )}

            {/* Violation Cards */}
            <div className="space-y-4">
                {violations.map((v) => {
                    const sev = endpointSeverity(v.endpoint);
                    const hasUser = !!v.user;
                    return (
                        <div key={v._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200">
                            <div className="flex flex-wrap justify-between gap-4">
                                {/* Left: incident info */}
                                <div className="space-y-3 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${sev.cls}`}>
                                            {sev.label}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                            <FaNetworkWired className="text-indigo-400/60" /> {v.ip}
                                        </span>
                                        {v.violationCount > 1 && (
                                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-bold">
                                                ×{v.violationCount} hits
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                                        <span>Endpoint: <strong className="text-slate-200 font-mono">{v.endpoint}</strong></span>
                                        {v.attemptedUsername && (
                                            <span>Tried: <strong className="text-slate-200">"{v.attemptedUsername}"</strong></span>
                                        )}
                                        <span>{new Date(v.createdAt).toLocaleString()}</span>
                                    </div>

                                    {/* Linked account pill */}
                                    {hasUser ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <img
                                                src={v.user.profileImage || "/avatar-placeholder.png"}
                                                className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                                alt={v.user.username}
                                            />
                                            <span className="text-xs font-bold text-slate-300">@{v.user.username}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${v.user.status === "suspended" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : v.user.status === "under_review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                                                {v.user.status}
                                            </span>
                                            <span className="text-[10px] text-slate-500">{v.user.strikes} strikes</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaRobot className="text-slate-600" />
                                            <span className="text-xs text-slate-500 italic">Anonymous / unauthenticated</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right: action buttons */}
                                <div className="flex flex-col gap-2 shrink-0 justify-center">
                                    <button
                                        onClick={() => openAiModal(v)}
                                        className="btn btn-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 border-none text-white font-bold rounded-xl px-4 cursor-pointer flex items-center gap-2"
                                    >
                                        <FaBrain className="text-xs" /> AI Analyze
                                    </button>

                                    {hasUser && v.user.role !== "admin" && (
                                        <>
                                            <button
                                                disabled={quickActionMutation.isPending}
                                                onClick={() => quickActionMutation.mutate({ userId: v.user._id, action: "warn" })}
                                                className="btn btn-sm bg-amber-600 hover:bg-amber-700 border-none text-white rounded-xl px-4 cursor-pointer flex items-center gap-2 disabled:opacity-40"
                                            >
                                                <FaExclamationTriangle className="text-xs" /> Warn
                                            </button>
                                            <button
                                                disabled={quickActionMutation.isPending || v.user.status === "suspended"}
                                                onClick={() => quickActionMutation.mutate({ userId: v.user._id, action: "suspend" })}
                                                className="btn btn-sm bg-rose-700 hover:bg-rose-800 border-none text-white rounded-xl px-4 cursor-pointer flex items-center gap-2 disabled:opacity-40"
                                            >
                                                <FaUserTimes className="text-xs" /> Suspend
                                            </button>
                                        </>
                                    )}

                                    <button
                                        disabled={dismissMutation.isPending}
                                        onClick={() => dismissMutation.mutate(v._id)}
                                        className="btn btn-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl px-4 cursor-pointer flex items-center gap-2 disabled:opacity-40"
                                    >
                                        <FaTrashAlt className="text-xs" /> Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI Modal */}
            {aiModalOpen && selectedViolation && (
                <AiModal
                    violation={selectedViolation}
                    onClose={() => { setAiModalOpen(false); setSelectedViolation(null); }}
                />
            )}
        </div>
    );
};

export default SecurityAlerts;
