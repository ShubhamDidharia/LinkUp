"use client"

import { FaRegComment } from "react-icons/fa"
import { BiRepost } from "react-icons/bi"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import { FaRegBookmark } from "react-icons/fa6"
import { FaTrash } from "react-icons/fa"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { useQueryClient } from "@tanstack/react-query"
import LoadingSpinner from "./LoadingSpinner"
import { formatPostDate } from "../../utils/date/index"

const Post = ({ post }) => {
  const [comment, setComment] = useState("")
  const postOwner = post.user

  // react query for post deletion
  const { data: authUser } = useQuery({ queryKey: ["authUser"] })
  const queryClient = useQueryClient()
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to delete post")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully")
      // invalidate queries to fetch updated posts after deleting
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  // react query for post liking
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, { method: "POST" })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to like post")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: (updatedLikes) => {
      // invalidate queries to fetch updated posts after liking is not best practice
      // instead update cached data
      // queryClient.invalidateQueries({queryKey : ['posts']});
      // queryClient.invalidateQueries({queryKey : ['authUser']});
      // jo return data kiya tha , onSuccess usi ko as argument pass kr rha (from nme updatedLikes)
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes }
          }
          return p
        })
      })
    },
  })

  const { mutate: commentPost, inPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to comment on post")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: (updatedPost) => {
      toast.success("Commented successfully")
      // invalidate queries to fetch updated posts after commenting is not best practice
      // instead update cached data
      // queryClient.invalidateQueries({queryKey : ['posts']});
      // queryClient.invalidateQueries({queryKey : ['authUser']});
      // jo return data kiya tha , onSuccess usi ko as argument pass kr rha (from nme updatedPost)
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return updatedPost
          }
          return p
        })
      })
      setComment("")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const isLiked = post.likes.includes(authUser._id)
  const isMyPost = authUser._id === post.user._id // bool
  const formattedDate = formatPostDate(post.createdAt)

  const handleDeletePost = () => {
    deletePost()
  }

  const handlePostComment = (e) => {
    e.preventDefault()
    if (isCommenting) return
    commentPost()
  }

  const handleLikePost = () => {
    if (isLiking) return // if already liking, return
    likePost()
  }

  return (
    <article className="bg-white hover:bg-slate-50/50 transition-all duration-200 p-6 group">
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <Link to={`/profile/${postOwner.username}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md hover:ring-blue-200 transition-all duration-200">
            <img
              src={postOwner.profileImage || "/avatar-placeholder.png"}
              alt={`${postOwner.fullName}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              to={`/profile/${postOwner.username}`}
              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              {postOwner.fullName}
            </Link>
            <Link
              to={`/profile/${postOwner.username}`}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              @{postOwner.username}
            </Link>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 text-sm">{formattedDate}</span>

            {isMyPost && (
              <div className="ml-auto">
                {!isDeleting ? (
                  <button
                    onClick={handleDeletePost}
                    className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Text */}
          {post.text && <p className="text-slate-800 leading-relaxed mb-4">{post.text}</p>}

          {/* Post Image */}
          {post.img && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200">
              <img src={post.img || "/placeholder.svg"} className="w-full h-auto object-cover" alt="Post content" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-8">
              {/* Comments */}
              <button
                className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors group/comment"
                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
              >
                <div className="p-2 rounded-full group-hover/comment:bg-blue-50 transition-colors">
                  <FaRegComment className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{post.comments.length}</span>
              </button>

              {/* Repost */}
              <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors group/repost">
                <div className="p-2 rounded-full group-hover/repost:bg-green-50 transition-colors">
                  <BiRepost className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">0</span>
              </button>

              {/* Like */}
              <button
                onClick={handleLikePost}
                className={`flex items-center gap-2 transition-colors group/like ${
                  isLiked ? "text-red-500" : "text-slate-500 hover:text-red-500"
                }`}
                disabled={isLiking}
              >
                <div className="p-2 rounded-full group-hover/like:bg-red-50 transition-colors">
                  {isLiking ? (
                    <LoadingSpinner size="sm" />
                  ) : isLiked ? (
                    <FaHeart className="w-4 h-4" />
                  ) : (
                    <FaRegHeart className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">{post.likes.length}</span>
              </button>
            </div>

            {/* Bookmark */}
            <button className="p-2 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors">
              <FaRegBookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <dialog id={`comments_modal${post._id}`} className="modal">
        <div className="modal-box bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Comments</h3>
            <form method="dialog">
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <span className="text-slate-500">✕</span>
              </button>
            </form>
          </div>

          <div className="space-y-4 max-h-60 overflow-auto mb-6">
            {post.comments.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">💬</div>
                </div>
                <p className="text-slate-500">No comments yet. Be the first to comment!</p>
              </div>
            )}

            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={comment.user.profileImage || "/avatar-placeholder.png"}
                    alt={`${comment.user.fullName}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{comment.user.fullName}</span>
                    <span className="text-slate-500 text-sm">@{comment.user.username}</span>
                  </div>
                  <p className="text-slate-700">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handlePostComment} className="border-t border-slate-200 pt-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={authUser?.profileImage || "/avatar-placeholder.png"}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
                  <textarea
                    className="w-full text-slate-800 placeholder-slate-500 resize-none border-none focus:outline-none bg-transparent"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!comment.trim() || isCommenting}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCommenting ? <LoadingSpinner size="sm" /> : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </article>
  )
}

export default Post
