"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { Link } from "react-router-dom"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import Post from "../../components/common/Post"
import { FaPlus, FaCheck } from "react-icons/fa"

const SearchUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTab, setSearchTab] = useState("users") // "users" or "posts"
  const queryClient = useQueryClient()

  const { data: authUser } = useQuery({ queryKey: ["authUser"] })

  // User Search
  const { data: searchResults = [], isLoading: isSearchingUsers } = useQuery({
    queryKey: ["searchUsers", searchQuery, searchTab],
    queryFn: async () => {
      if (searchTab !== "users" || !searchQuery.trim()) return []
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error("Failed to search users")
      }
      return data
    },
    enabled: searchTab === "users" && searchQuery.trim().length > 0,
  })

  // AI Post Search
  const { data: postSearchResults = [], isLoading: isSearchingPosts } = useQuery({
    queryKey: ["searchPosts", searchQuery, searchTab],
    queryFn: async () => {
      if (searchTab !== "posts" || !searchQuery.trim()) return []
      const res = await fetch(`/api/posts/search/ai?query=${encodeURIComponent(searchQuery)}`)
      const result = await res.json()
      if (!res.ok) {
        throw new Error("Failed to search posts")
      }
      // Handle both direct array response and object with posts property
      return result.posts || result
    },
    enabled: searchTab === "posts" && searchQuery.trim().length > 0,
  })

  const { mutate: followUnfollowUser, isPending: isFollowPending } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/follow/${userId}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to follow/unfollow user")
      }
      return data
    },
    onSuccess: (data, userId) => {
      queryClient.setQueryData(["searchUsers", searchQuery, "users"], (oldData) => {
        return oldData.map((user) => {
          if (user._id === userId) {
            const isFollowing = authUser.following.includes(userId)
            return {
              ...user,
              isFollowing: !isFollowing,
            }
          }
          return user
        })
      })
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
      toast.success(data.message)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleFollowClick = (userId) => {
    followUnfollowUser(userId)
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white min-h-screen border-x border-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Search</h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder={searchTab === "users" ? "Search by name or username..." : "Search posts (e.g., 'travel', 'tech tips', 'motivation')..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 rounded-full border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => {
                setSearchTab("users")
                setSearchQuery("")
              }}
              className={`px-4 py-2 font-semibold transition-colors relative ${
                searchTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => {
                setSearchTab("posts")
                setSearchQuery("")
              }}
              className={`px-4 py-2 font-semibold transition-colors relative ${
                searchTab === "posts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Posts (AI-Powered)
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="divide-y divide-slate-200">
        {searchQuery.trim() === "" && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-slate-600 font-semibold mb-2">Start searching</p>
              <p className="text-slate-500 text-sm">
                {searchTab === "users" ? "Search for users to follow" : "Search for posts with AI understanding"}
              </p>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {searchTab === "users" && (
          <>
            {searchQuery.trim() !== "" && isSearchingUsers && (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {searchQuery.trim() !== "" && !isSearchingUsers && searchResults.length === 0 && (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">😕</span>
                  </div>
                  <p className="text-slate-600 font-semibold mb-2">No users found</p>
                  <p className="text-slate-500 text-sm">Try searching with different keywords</p>
                </div>
              </div>
            )}

            {searchResults.map((user) => {
              const isFollowing = authUser?.following?.includes(user._id) || false

              return (
                <div key={user._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-md hover:ring-blue-200 transition-all duration-200">
                        <img
                          src={user.profileImage || "/avatar-placeholder.png"}
                          alt={`${user.fullName}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${user.username}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors block mb-1"
                      >
                        {user.fullName}
                      </Link>
                      <p className="text-slate-500 text-sm mb-2">@{user.username}</p>
                      {user.bio && <p className="text-slate-700 text-sm">{user.bio}</p>}
                    </div>

                    <button
                      onClick={() => handleFollowClick(user._id)}
                      disabled={isFollowPending}
                      className={`px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 flex-shrink-0 ${
                        isFollowing
                          ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isFollowPending ? (
                        <LoadingSpinner size="sm" />
                      ) : isFollowing ? (
                        <>
                          <FaCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <FaPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* POSTS TAB */}
        {searchTab === "posts" && (
          <>
            {searchQuery.trim() !== "" && isSearchingPosts && (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {searchQuery.trim() !== "" && !isSearchingPosts && postSearchResults.length === 0 && (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">😕</span>
                  </div>
                  <p className="text-slate-600 font-semibold mb-2">No posts found</p>
                  <p className="text-slate-500 text-sm">Try searching with different keywords or topics</p>
                </div>
              </div>
            )}

            {postSearchResults.length > 0 && (
              <div>
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-sm text-slate-600">
                    Found <span className="font-semibold text-slate-900">{postSearchResults.length}</span> posts matching your search
                  </p>
                </div>
                {postSearchResults.map((post) => (
                  <Post key={post._id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchUsersPage
