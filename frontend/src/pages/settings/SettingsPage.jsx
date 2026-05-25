import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/users/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete account");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      // Clear all cached data
      queryClient.invalidateQueries();
      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This will permanently delete your account and all associated data.\n\nThis action cannot be undone."
    );
    if (confirmed) {
      deleteAccount();
    }
  };

  const handleToggleNsfw = () => {
    const newValue = !hideNSFW;
    setHideNSFW(newValue);
    updateSettings({ hideNSFW: newValue });
  };

  return (
    <div className="flex-1 bg-[#0D0D0D] min-h-screen border-x border-[#2A2A2A] transition-colors\">
      <div className="sticky top-0 z-20 bg-[#111111]/95 backdrop-blur-xl border-b border-[#2A2A2A] shadow-sm transition-colors\">
        <div className="flex gap-6 px-6 py-4 items-center">
          <Link
            to="/"
            className="p-3 rounded-full hover:bg-[#1A1A1A] transition-all duration-200 hover:scale-105"
          >
            <FaArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex flex-col flex-1">
            <h1 className="font-bold text-xl text-white\">Settings</h1>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-[#1A1A1A] rounded-3xl p-8 shadow-lg border border-[#2A2A2A] transition-colors max-w-2xl mx-auto\">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#2A2A2A] pb-4">
            Content Preferences
          </h2>
          
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-lg font-semibold text-white">Hide NSFW Content</span>
              <span className="text-sm text-[#888888]">
                Hide content marked as Not Safe For Work from your feeds altogether.
              </span>
            </div>
            
            <button
              onClick={handleToggleNsfw}
              disabled={isPending}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8450A] focus:ring-offset-2 ${
                hideNSFW ? 'bg-[#E8450A]' : 'bg-[#2A2A2A]'
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

        {/* Danger Zone */}
        <div className="bg-[#2A1A1A] rounded-3xl p-8 shadow-lg border border-[#8B0000] transition-colors max-w-2xl mx-auto mt-6\">
          <h2 className="text-2xl font-bold text-red-500 mb-2 pb-4\">Danger Zone</h2>
          <p className="text-[#888888] mb-6\">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting Account..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
