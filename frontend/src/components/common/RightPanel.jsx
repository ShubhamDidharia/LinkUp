"use client"

import { Link } from "react-router-dom"
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton"
import { useQuery } from "@tanstack/react-query"
import useFollow from "../../hooks/useFollow"
import LoadingSpinner from "./LoadingSpinner"

const RightPanel = () => {
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested")
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

  const { follow, isPending } = useFollow()

  return (
    <div className="hidden lg:block w-80 p-4">
      <div className="sticky top-4 space-y-6">
        {/* Who to Follow Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Who to follow</h2>
            <p className="text-sm text-slate-600 mt-1">Discover amazing people</p>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading && (
              <div className="space-y-4">
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </div>
            )}

            {!isLoading && suggestedUsers?.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">👥</div>
                </div>
                <p className="text-slate-500 text-sm">No suggestions available</p>
              </div>
            )}

            {!isLoading && suggestedUsers?.length > 0 && (
              <div className="space-y-3">
                {suggestedUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="group p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md group-hover:ring-blue-200 transition-all duration-200">
                            <img
                              src={user.profileImage || "/avatar-placeholder.png"}
                              alt={`${user.fullName}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-slate-500 truncate">@{user.username}</p>
                        </div>
                      </Link>

                      <button
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault()
                          follow(user._id)
                        }}
                        disabled={isPending}
                      >
                        {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && suggestedUsers?.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <Link
                to="/explore"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium hover:underline transition-colors"
              >
                Show more suggestions
              </Link>
            </div>
          )}
        </div>

        {/* Trending Topics Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">What's happening</h2>
            <p className="text-sm text-slate-600 mt-1">Trending topics for you</p>
          </div>

          <div className="p-4 space-y-3">
            {[
              { category: "Technology", topic: "React 19", posts: "12.5K posts" },
              { category: "Programming", topic: "JavaScript", posts: "8.2K posts" },
              { category: "Web Dev", topic: "Tailwind CSS", posts: "5.1K posts" },
            ].map((trend, index) => (
              <div
                key={index}
                className="p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-200 group"
              >
                <p className="text-xs text-slate-500 uppercase tracking-wide">{trend.category}</p>
                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {trend.topic}
                </p>
                <p className="text-xs text-slate-500 mt-1">{trend.posts}</p>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Link
              to="/trending"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium hover:underline transition-colors"
            >
              Show more trends
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <Link to="/terms" className="hover:text-slate-700 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-slate-700 transition-colors">
              Cookie Policy
            </Link>
            <Link to="/about" className="hover:text-slate-700 transition-colors">
              About
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-3">© 2024 Your Social App. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default RightPanel
