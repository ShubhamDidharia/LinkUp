
import { Link } from "react-router-dom"
import { useEffect } from "react"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { IoSettingsOutline } from "react-icons/io5"
import { FaUser, FaArrowLeft } from "react-icons/fa"
import { FaHeart } from "react-icons/fa6"
import { MdComment, MdWarning, MdCheckCircle } from "react-icons/md"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSocket } from "../../hooks/useSocket"

const NotificationPage = () => {
  // react query for notifications
  const queryClient = useQueryClient()
  const { data: authUser } = useQuery({ queryKey: ["authUser"] })

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

  // Initialize Socket.IO connection
  useSocket(authUser?._id)

  const { mutate: markNotificationAsRead } = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}/read`, { method: "PUT" })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Failed to mark as read")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] })
    },
  })

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to delete notification")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] })
    },
  })

  const { mutate: deleteAllReadNotifications } = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] })
    },
  })

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case "follow":
        return <FaUser className={iconClass} />
      case "like":
        return <FaHeart className={iconClass} />
      case "comment":
        return <MdComment className={iconClass} />
      case "admin_warning":
      case "admin_suspend":
        return <MdWarning className={iconClass} />
      case "admin_content_removed":
      case "post_auto_moderated":
      case "auto_moderated_nsfw":
        return <MdCheckCircle className={iconClass} />
      case "reported":
        return <MdWarning className={iconClass} />
      default:
        return <FaUser className={iconClass} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "follow":
        return "bg-blue-100 text-blue-600"
      case "like":
        return "bg-red-100 text-red-500"
      case "comment":
        return "bg-green-100 text-green-600"
      case "admin_warning":
        return "bg-yellow-100 text-yellow-600"
      case "admin_suspend":
      case "admin_content_removed":
        return "bg-red-100 text-red-600"
      case "post_auto_moderated":
      case "auto_moderated_nsfw":
        return "bg-orange-100 text-orange-600"
      case "reported":
        return "bg-red-100 text-red-600"
      default:
        return "bg-slate-100 text-slate-600"
    }
  }

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case "follow":
        return `${notification.from?.username} started following you`
      case "like":
        return `${notification.from?.username} liked your post`
      case "comment":
        return `${notification.from?.username} commented on your post`
      case "admin_warning":
        return `⚠️ Warning: ${notification.message || "You received a warning from moderation"}`
      case "admin_suspend":
        return `🚫 Suspended: ${notification.message || "Your account has been suspended"}`
      case "admin_content_removed":
        return `🗑️ Content Removed: ${notification.message || "Your content was removed"}`
      case "post_auto_moderated":
        return `📋 Auto-Moderated: ${notification.reason || "Your post was flagged"}`
      case "auto_moderated_nsfw":
        return `⚠️ NSFW Flagged: ${notification.reason || "Your post was flagged as NSFW"}`
      case "reported":
        return `📢 Reported: Your ${notification.reason?.split(" ")[0] || "content"} was reported`
      default:
        return `${notification.message || "You have a new notification"}`
    }
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 dark:from-slate-900/50 to-white dark:to-slate-900 min-h-screen border-x border-slate-200 dark:border-slate-700 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/profile/${authUser?.username}`}
              className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
              title="Go back to profile"
            >
              <FaArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {notifications?.length > 0
                  ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`
                  : "Stay updated"}
              </p>
            </div>
          </div>

          <div className="relative group">
            <button className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200 group-hover:scale-105">
              <IoSettingsOutline className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
              <div className="p-2">
                <button
                  onClick={() => deleteAllReadNotifications()}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-150 font-medium"
                >
                  Delete all read notifications
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
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">Loading notifications...</p>
        </div>
      )}

      {/* Empty State */}
      {notifications?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6">
            <div className="text-3xl">🔔</div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No notifications yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            When someone follows you, likes your posts, or admins take action, you'll see it here.
          </p>
        </div>
      )}

      {/* Notifications List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {notifications?.map((notification, index) => (
          <div
            key={notification._id}
            onClick={() => !notification.read && markNotificationAsRead(notification._id)}
            className={`group transition-all duration-200 cursor-pointer ${
              notification.read
                ? "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                : "bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
            }`}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: "fadeInUp 0.5s ease-out forwards",
            }}
          >
            <div className="flex items-start gap-4 p-6 relative">
              {/* Unread Indicator */}
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              )}

              {/* Notification Icon */}
              <div className="flex-shrink-0 ml-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                {/* For user-based notifications (follow, like, comment) */}
                {(notification.type === "follow" || notification.type === "like" || notification.type === "comment") && (
                  <Link
                    to={`/profile/${notification.from?.username}`}
                    className="block group-hover:scale-[1.01] transition-transform duration-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-sm">
                        <img
                          src={notification.from?.profileImage || "/avatar-placeholder.png"}
                          alt={`${notification.from?.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!notification.read ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"}`}>
                          @{notification.from?.username}
                        </p>
                      </div>
                    </div>

                    <div className="ml-2">
                      <p className={`text-sm leading-relaxed ${!notification.read ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                        {getNotificationMessage(notification)}
                      </p>
                      {notification.relatedPostId && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {notification.relatedPostId?.text}
                        </p>
                      )}
                    </div>
                  </Link>
                )}

                {/* For admin/system notifications */}
                {(notification.type === "admin_warning" ||
                  notification.type === "admin_suspend" ||
                  notification.type === "admin_content_removed" ||
                  notification.type === "post_auto_moderated" ||
                  notification.type === "auto_moderated_nsfw" ||
                  notification.type === "reported") && (
                  <div>
                    <p className={`text-sm leading-relaxed ${!notification.read ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                      {getNotificationMessage(notification)}
                    </p>
                    {notification.strikesCount && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        You now have {notification.strikesCount} strike(s)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Read Status & Delete Button */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {!notification.read && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification._id)
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200"
                  title="Delete notification"
                >
                  ✕
                </button>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                {new Date(notification.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPage
