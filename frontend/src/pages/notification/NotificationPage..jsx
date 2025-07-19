"use client"


import { Link } from "react-router-dom"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { IoSettingsOutline } from "react-icons/io5"
import { FaUser } from "react-icons/fa"
import { FaHeart } from "react-icons/fa6"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

const NotificationPage = () => {
  // react query for notifications
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
  })

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", { method: "DELETE" })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to delete notifications")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully")
      // invalidate queries to fetch updated notifications after deleting
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  return (
    <div className="flex-[4_4_0] bg-gradient-to-b from-slate-50 to-white min-h-screen border-x border-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex justify-between items-center p-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              {notifications?.length > 0
                ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`
                : "Stay updated"}
            </p>
          </div>

          <div className="relative group">
            <button className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-200 group-hover:scale-105">
              <IoSettingsOutline className="w-5 h-5 text-slate-600" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              <div className="p-2">
                <button
                  onClick={deleteNotifications}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 font-medium"
                >
                  Delete all notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center h-96">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 mt-4 text-sm">Loading notifications...</p>
        </div>
      )}

      {/* Empty State */}
      {notifications?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <div className="text-3xl">🔔</div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications yet</h3>
          <p className="text-slate-500 text-center max-w-sm">
            When someone follows you or likes your posts, you'll see it here.
          </p>
        </div>
      )}

      {/* Notifications List */}
      <div className="divide-y divide-slate-100">
        {notifications?.map((notification, index) => (
          <div
            key={notification._id}
            className="group hover:bg-slate-50/50 transition-all duration-200"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: "fadeInUp 0.5s ease-out forwards",
            }}
          >
            <div className="flex items-start gap-4 p-6">
              {/* Notification Icon */}
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.type === "follow" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-500"
                  }`}
                >
                  {notification.type === "follow" && <FaUser className="w-5 h-5" />}
                  {notification.type === "like" && <FaHeart className="w-5 h-5" />}
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${notification.from.username}`}
                  className="block group-hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                      <img
                        src={notification.from.profileImg || "/avatar-placeholder.png"}
                        alt={`${notification.from.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium truncate">@{notification.from.username}</p>
                    </div>
                  </div>

                  <div className="ml-13">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {notification.type === "follow" ? (
                        <span>
                          <span className="font-medium">Started following you</span>
                          <span className="ml-2 text-slate-400">•</span>
                          <span className="ml-2 text-slate-500">Follow back</span>
                        </span>
                      ) : (
                        <span>
                          <span className="font-medium">Liked your post</span>
                          <span className="ml-2 text-slate-400">•</span>
                          <span className="ml-2 text-slate-500">View post</span>
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Notification Badge */}
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPage
