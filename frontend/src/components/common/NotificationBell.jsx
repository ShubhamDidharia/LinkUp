"use client"

import { Link } from "react-router-dom"
import { IoNotifications } from "react-icons/io5"
import { useQuery } from "@tanstack/react-query"

const NotificationBell = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] })
  
  const { data: unreadCountData } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications/unread/count")
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch unread count")
        }
        return data
      } catch (error) {
        console.error("Error fetching unread count:", error)
        return { unreadCount: 0 }
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  })

  const unreadCount = unreadCountData?.unreadCount || 0

  return (
    <Link
      to="/notifications"
      className="relative p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
      title="Notifications"
    >
      <div className="relative">
        <IoNotifications className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors" />
        
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </div>
    </Link>
  )
}

export default NotificationBell
