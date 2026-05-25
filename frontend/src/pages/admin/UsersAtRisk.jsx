import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FaUserTimes, FaExclamationTriangle, FaUserCheck,
    FaChevronDown, FaChevronUp, FaTimes, FaImage,
    FaComment, FaFileAlt, FaCalendarAlt, FaEnvelope
} from "react-icons/fa";
import { toast } from "sonner";

// ── Post Detail Popup Modal ───────────────────────────────────────────────────
const PostModal = ({ post, onClose }) => {
    if (!post) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-theme-dark/80 border border-theme-purple/20 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h3 className="font-extrabold text-white flex items-center gap-2">
                        <FaFileAlt className="text-theme-purple" />
                        Full Post Content
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Post image */}
                    {post.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                            <img
                                src={post.imageUrl}
                                alt="Post content"
                                className="w-full max-h-80 object-contain"
                            />
                        </div>
                    )}
                    {!post.imageUrl && (
                        <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-slate-800 text-slate-600 gap-2">
                            <FaImage />
                            <span className="text-xs">No image attached</span>
                        </div>
                    )}

                    {/* Post text */}
                    {post.text ? (
                        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {post.text}
                        </p>
                    ) : (
                        <p className="text-slate-500 text-sm italic">No text content.</p>
                    )}

                    {/* Metadata row */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 border-t border-slate-800 pt-3">
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                        {post.isNSFW && (
                            <span className="px-2 py-0.5 bg-theme-coral/10 text-theme-coral border border-theme-coral/20 rounded-full font-bold">
                                NSFW Tagged
                            </span>
                        )}
                        {post.autoFlagged && (
                            <span className="px-2 py-0.5 bg-theme-yellow/10 text-theme-yellow border border-theme-yellow/20 rounded-full font-bold">
                                Auto-Flagged
                            </span>
                        )}
                        {post.flagReasons?.length > 0 && (
                            <span className="text-theme-yellow">⚑ {post.flagReasons.join(", ")}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── User History Drawer ───────────────────────────────────────────────────────
const UserHistoryDrawer = ({ user, onClose }) => {
    const [historyTab, setHistoryTab] = useState("posts");
    const [selectedPost, setSelectedPost] = useState(null);
    const queryClient = useQueryClient();

    const { data: posts = [], isLoading: postsLoading } = useQuery({
        queryKey: ["adminUserPosts", user._id],
        queryFn: async () => {
            const res = await fetch(`/api/reports/user/${user._id}/posts`);
            if (!res.ok) throw new Error("Failed to load posts");
            return res.json();
        }
    });

    const { data: comments = [], isLoading: commentsLoading } = useQuery({
        queryKey: ["adminUserComments", user._id],
        queryFn: async () => {
            const res = await fetch(`/api/reports/user/${user._id}/comments`);
            if (!res.ok) throw new Error("Failed to load comments");
            return res.json();
        }
    });

    const actionMutation = useMutation({
        mutationFn: async (action) => {
            const res = await fetch(`/api/reports/user/${user._id}/${action}`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Failed to ${action}`);
            return data;
        },
        onSuccess: (data, action) => {
            toast.success(`User ${action}ed successfully`);
            queryClient.invalidateQueries({ queryKey: ["usersAtRisk"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return (
        <div className="mt-3 bg-theme-dark/80 border border-theme-purple/20 rounded-2xl overflow-hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-theme-dark/60">
                <div className="flex items-center gap-3">
                    <img
                        src={user.profileImage || "/avatar-placeholder.png"}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        alt={user.username}
                    />
                    <span className="font-bold text-white text-sm">@{user.username}'s Content History</span>
                    <span className="text-xs text-slate-500">({posts.length} posts · {comments.length} comments)</span>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer transition-colors">
                    <FaTimes />
                </button>
            </div>

            {/* History tab switcher */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setHistoryTab("posts")}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${historyTab === "posts" ? "text-theme-purple border-b-2 border-theme-purple bg-theme-dark/40" : "text-slate-500 hover:text-slate-300"}`}
                >
                    <FaFileAlt /> Posts ({posts.length})
                </button>
                <button
                    onClick={() => setHistoryTab("comments")}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${historyTab === "comments" ? "text-theme-purple border-b-2 border-theme-purple bg-theme-dark/40" : "text-slate-500 hover:text-slate-300"}`}
                >
                    <FaComment /> Comments ({comments.length})
                </button>
            </div>

            {/* Content area */}
            <div className="max-h-80 overflow-y-auto p-4">
                {historyTab === "posts" && (
                    postsLoading ? (
                        <div className="flex justify-center py-8"><span className="loading loading-spinner text-theme-purple"></span></div>
                    ) : posts.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm py-8 italic">No posts found for this user.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {posts.map((post) => (
                                <button
                                    key={post._id}
                                    onClick={() => setSelectedPost(post)}
                                    className="bg-slate-900 border border-slate-800 hover:border-theme-purple/40 rounded-xl p-3 text-left transition-all duration-200 cursor-pointer group"
                                >
                                    {/* Thumbnail if has image */}
                                    {post.imageUrl && (
                                        <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-950">
                                            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    )}
                                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                                        {post.text || <span className="italic text-slate-500">Image-only post</span>}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="text-[10px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        {post.autoFlagged && (
                                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-bold">FLAGGED</span>
                                        )}
                                        {post.isNSFW && (
                                            <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded text-[9px] font-bold">NSFW</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                )}

                {historyTab === "comments" && (
                    commentsLoading ? (
                        <div className="flex justify-center py-8"><span className="loading loading-spinner text-theme-purple"></span></div>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm py-8 italic">No comments found for this user.</p>
                    ) : (
                        <div className="space-y-2">
                            {comments.map((comment) => (
                                <div key={comment._id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                                    <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>
                                    <span className="text-[10px] text-slate-500 mt-1 block">{new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Quick Actions footer */}
            {user.role !== "admin" && (
                <div className="flex gap-2 p-4 border-t border-slate-800 bg-theme-dark/50">
                    <button
                        disabled={actionMutation.isPending}
                        onClick={() => actionMutation.mutate("warn")}
                        className="btn btn-sm bg-theme-yellow hover:bg-theme-yellow/80 border-none text-white rounded-xl px-4 cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                    >
                        <FaExclamationTriangle className="text-xs" /> Warn
                    </button>
                    {user.status !== "suspended" && (
                        <button
                            disabled={actionMutation.isPending}
                            onClick={() => actionMutation.mutate("suspend")}
                            className="btn btn-sm bg-theme-coral hover:bg-theme-coral/80 border-none text-white rounded-xl px-4 cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                        >
                            <FaUserTimes className="text-xs" /> Suspend
                        </button>
                    )}
                    {(user.status === "suspended" || user.strikes > 0) && (
                        <button
                            disabled={actionMutation.isPending}
                            onClick={() => actionMutation.mutate("unsuspend")}
                            className="btn btn-sm bg-theme-purple hover:bg-theme-purple/80 border-none text-white rounded-xl px-4 cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                        >
                            <FaUserCheck className="text-xs" /> Reset & Restore
                        </button>
                    )}
                </div>
            )}

            {/* Post full-content modal */}
            {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
        </div>
    );
};

// ── User Card ─────────────────────────────────────────────────────────────────
const UserCard = ({ user }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-theme-dark/80 border border-theme-purple/20 rounded-2xl overflow-hidden hover:border-theme-purple/40 transition-all duration-200">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between gap-4 cursor-pointer text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src={user.profileImage || "/avatar-placeholder.png"}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shrink-0"
                        alt={user.username}
                    />
                    <div className="min-w-0">
                        <p className="font-extrabold text-white text-sm truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <FaEnvelope className="text-theme-purple/60 text-[10px]" />
                            <span className="truncate max-w-32">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-theme-coral font-bold">{user.strikes} strikes</span>
                            <span className="text-[10px] text-slate-500">·</span>
                            <span className="text-[10px] text-theme-yellow">{user.autoFlaggedPosts} flagged posts</span>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${user.status === "suspended" ? "bg-theme-coral/10 text-theme-coral border-theme-coral/20" : "bg-theme-yellow/10 text-theme-yellow border-theme-yellow/20"}`}>
                        {user.status}
                    </span>
                    {expanded ? <FaChevronUp className="text-slate-400 text-xs" /> : <FaChevronDown className="text-slate-400 text-xs" />}
                </div>
            </button>

            {/* Expandable drawer */}
            {expanded && <UserHistoryDrawer user={user} onClose={() => setExpanded(false)} />}
        </div>
    );
};

// ── Main UsersAtRisk Page ─────────────────────────────────────────────────────
const UsersAtRisk = () => {
    const [activeTab, setActiveTab] = useState("suspended");

    const { data, isLoading } = useQuery({
        queryKey: ["usersAtRisk"],
        queryFn: async () => {
            const res = await fetch("/api/admin/users-at-risk");
            if (!res.ok) throw new Error("Failed to fetch at-risk users");
            return res.json();
        }
    });

    const suspended = data?.suspended || [];
    const underReview = data?.underReview || [];
    const displayList = activeTab === "suspended" ? suspended : underReview;

    return (
        <div className="p-8 space-y-6 text-slate-100 animate-fade-in">
            {/* Page header */}
            <div className="border-b border-slate-900 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-theme-coral via-theme-pink to-theme-yellow bg-clip-text text-transparent">
                    Users Overview
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Suspended and under-review accounts. Click a user to inspect their post and comment history.
                </p>
            </div>

            {/* Pill Slider Toggle */}
            <div className="inline-flex items-center bg-theme-dark/60 border border-theme-purple/30 p-1 rounded-xl gap-1">
                <button
                    onClick={() => setActiveTab("suspended")}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeTab === "suspended" ? "bg-gradient-to-r from-theme-coral to-theme-pink text-white shadow-lg shadow-theme-coral/20" : "text-slate-400 hover:text-slate-200"}`}
                >
                    <FaUserTimes className="text-xs" />
                    Suspended
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === "suspended" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                        {suspended.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("under_review")}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeTab === "under_review" ? "bg-gradient-to-r from-theme-yellow to-theme-pink text-white shadow-lg shadow-theme-yellow/20" : "text-slate-400 hover:text-slate-200"}`}
                >
                    <FaExclamationTriangle className="text-xs" />
                    Under Review
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === "under_review" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                        {underReview.length}
                    </span>
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center py-24">
                    <span className="loading loading-spinner loading-md text-theme-purple"></span>
                </div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                    <FaUserCheck className="text-4xl mx-auto mb-4 text-theme-purple/40" />
                    <p className="font-semibold text-slate-400">
                        No {activeTab === "suspended" ? "suspended" : "under-review"} accounts.
                    </p>
                    <p className="text-sm text-slate-500 mt-1">All users in this category are clear.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayList.map((user) => (
                        <UserCard key={user._id} user={user} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersAtRisk;
