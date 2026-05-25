"use client"

import Post from "./Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all"
      case "following":
        return "/api/posts/followerPosts"
      // posts made by authUser
      case "posts":
        return `/api/posts/user/${username}`
      // posts liked byauthUser
      case "likes":
        return `/api/posts/liked/${userId}`
      default:
        return "/api/posts/all"
    }
  }

  const POST_ENDPOINT = getPostEndpoint()
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT)
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

  //Whenever feedType or refetch changes, call the refetch() function.
  // refetch() is a function provided by React Query's useQuery() hook to manually
  // re-run the query and fetch fresh data.
  useEffect(() => {
    refetch()
  }, [feedType, refetch])

  return (
    <div className="bg-[#0D0D0D] min-h-screen transition-colors\">
      {(isLoading || isRefetching) && (
        <div className="space-y-4 p-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && !isRefetching && posts?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-24 h-24 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full flex items-center justify-center mb-6\">
            <div className="text-3xl">📝</div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No posts yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            {feedType === "following"
              ? "Follow some people to see their posts here"
              : "Be the first to share something amazing!"}
          </p>
        </div>
      )}

      {!isLoading && !isRefetching && posts && (
        <div className="divide-y divide-[#2A2A2A]\">
          {posts.map((post, index) => (
            <div
              key={post._id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Posts
