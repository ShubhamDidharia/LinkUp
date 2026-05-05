"use client"

import { useQuery } from "@tanstack/react-query"
import Posts from "../../components/common/Posts"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const BookmarkedPostsPage = () => {
  const { data: bookmarkedPosts, isLoading, isError, error } = useQuery({
    queryKey: ["bookmarkedPosts"],
    queryFn: async () => {
      const res = await fetch("/api/posts/bookmarked")
      const data = await res.json()
      if (!res.ok) {
        throw new Error("Failed to fetch bookmarked posts")
      }
      return data
    },
  })

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white min-h-screen border-x border-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-900">Bookmarked Posts</h2>
          <p className="text-slate-500 text-sm mt-1">View all your saved posts</p>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-slate-200">
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-red-600 font-semibold mb-2">Error loading bookmarks</p>
              <p className="text-slate-600">{error?.message}</p>
            </div>
          </div>
        )}

        {bookmarkedPosts && bookmarkedPosts.length === 0 && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📑</span>
              </div>
              <p className="text-slate-600 font-semibold mb-2">No bookmarks yet</p>
              <p className="text-slate-500 text-sm">Posts you bookmark will appear here</p>
            </div>
          </div>
        )}

        {bookmarkedPosts && bookmarkedPosts.length > 0 && (
          <Posts posts={bookmarkedPosts} />
        )}
      </div>
    </div>
  )
}

export default BookmarkedPostsPage
