import { useState } from "react";
import { toast } from "sonner";
import { FaTimes, FaFlag } from "react-icons/fa";

const categories = [
    { value: "Inappropriate/NSFW", label: "Inappropriate or NSFW content" },
    { value: "Hate speech", label: "Hate speech, abuse, or harassment" },
    { value: "Spam", label: "Spam, scams, or misleading links" },
    { value: "Impersonation", label: "Impersonation or identity theft" },
    { value: "Other", label: "Other policy violation" }
];

const ReportModal = ({ isOpen, onClose, reportedUser, reportType, targetId }) => {
    const [selectedCategory, setSelectedCategory] = useState("Inappropriate/NSFW");
    const [additionalNote, setAdditionalNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const reason = `${selectedCategory}${additionalNote ? ` - ${additionalNote}` : ""}`;

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportedUser,
                    reportType,
                    targetId: targetId || undefined,
                    reason
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to submit report");
            }

            toast.success("Thank you! Report submitted successfully.");
            onClose();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-850">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><FaFlag className="text-sm" /></span>
                        <span>Submit a Report</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Categories */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Why are you reporting this?</label>
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <label 
                                    key={cat.value} 
                                    className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                                >
                                    <input 
                                        type="radio" 
                                        name="category"
                                        value={cat.value}
                                        checked={selectedCategory === cat.value}
                                        onChange={() => setSelectedCategory(cat.value)}
                                        className="radio radio-primary radio-sm"
                                    />
                                    <span className="text-sm text-slate-300 font-medium">{cat.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Explanatory text */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Additional Context (Optional)</label>
                        <textarea 
                            value={additionalNote}
                            onChange={(e) => setAdditionalNote(e.target.value)}
                            placeholder="Provide any details that will help our moderation team review this case..." 
                            className="textarea textarea-bordered bg-slate-950 border-slate-850 w-full text-slate-300 text-sm focus:border-indigo-500 rounded-xl"
                            rows={3}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost text-slate-400 hover:text-white rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="btn bg-rose-600 hover:bg-rose-700 disabled:opacity-50 border-none text-white px-6 rounded-xl font-bold"
                        >
                            {submitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
