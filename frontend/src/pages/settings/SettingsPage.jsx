import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [hideNSFW, setHideNSFW] = useState(true);

  // Initialize state from authUser
  useEffect(() => {
    if (authUser && authUser.hideNSFW !== undefined) {
      setHideNSFW(authUser.hideNSFW);
    }
  }, [authUser]);

  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (newSettings) => {
      try {
        const res = await fetch("/api/users/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSettings),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update settings");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      // Invalidate posts to trigger a refetch of the feed with the new setting
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
      // Revert the local state if the API call fails
      setHideNSFW(!hideNSFW);
    },
  });

  const handleToggleNsfw = () => {
    const newValue = !hideNSFW;
    setHideNSFW(newValue);
    updateSettings({ hideNSFW: newValue });
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 dark:from-slate-900/50 to-white dark:to-slate-900 min-h-screen border-x border-slate-200 dark:border-slate-700 transition-colors">
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex gap-6 px-6 py-4 items-center">
          <Link
            to="/"
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
          >
            <FaArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </Link>
          <div className="flex flex-col flex-1">
            <h1 className="font-bold text-xl text-slate-900 dark:text-slate-100">Settings</h1>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-700 transition-colors max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
            Content Preferences
          </h2>
          
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hide NSFW Content</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Hide content marked as Not Safe For Work from your feeds altogether.
              </span>
            </div>
            
            <button
              onClick={handleToggleNsfw}
              disabled={isPending}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                hideNSFW ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="sr-only">Toggle NSFW filter</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  hideNSFW ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
