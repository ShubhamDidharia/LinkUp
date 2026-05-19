"use client"

import { FaRegComment } from "react-icons/fa"
import { BiRepost } from "react-icons/bi"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import { FaRegBookmark, FaBookmark } from "react-icons/fa6"
import { FaTrash, FaEdit, FaFlag } from "react-icons/fa"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import LoadingSpinner from "./LoadingSpinner"
import { formatPostDate } from "../../utils/date/index"
import ReportModal from "./ReportModal"

const Post = ({ post }) => {
  const [comment, setComment] = useState("")
  const [editText, setEditText] = useState(post.text)
  const [editImg, setEditImg] = useState(post.img)
  const [editMode, setEditMode] = useState(false)
  const [showNsfw, setShowNsfw] = useState(false)
  const [reportModalData, setReportModalData] = useState({
    isOpen: false,
    reportedUser: null,
    reportType: "post",
    targetId: null
  })
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

  const { mutate: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editText, img: editImg }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to update post")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: (updatedPost) => {
      toast.success("Post updated successfully")
      setEditMode(false)
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return updatedPost
          }
          return p
        })
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { mutate: bookmarkPost, isPending: isBookmarking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/bookmark/${post._id}`, {
          method: "POST",
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to bookmark post")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, isBookmarked: data.isBookmarked }
          }
          return p
        })
      })
      if (data.isBookmarked) {
        toast.success("Post bookmarked")
      } else {
        toast.success("Bookmark removed")
      }
    },
  })

  const { mutate: toggleNsfw, isPending: isTogglingNsfw } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/nsfw/${post._id}`, {
          method: "POST",
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to toggle NSFW status")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    // Optimistic update - update UI before server response
    onMutate: async () => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] })

      // Snapshot previous data
      const previousPosts = queryClient.getQueryData(["posts"])

      // Optimistically update the cache
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData?.map((p) => {
          if (p._id === post._id) {
            return { ...p, isNSFW: !p.isNSFW }
          }
          return p
        })
      })

      return { previousPosts }
    },
    // On success, show confirmation toast
    onSuccess: (data) => {
      toast.success(`Post marked as ${data.isNSFW ? "NSFW" : "Safe"}`)
    },
    // On error, revert to previous state
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts)
      }
      toast.error("Failed to update NSFW status. Please try again.")
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
  const isMyPost = authUser._id === post.user._id
  const isBookmarked = authUser?.bookmarkedPosts?.includes(post._id) || post.isBookmarked || false
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
    if (isLiking) return
    likePost()
  }

  const handleUpdatePost = () => {
    if (!editText && !editImg) {
      toast.error("Post cannot be empty")
      return
    }
    updatePost()
  }

  const handleBookmarkPost = () => {
    if (isBookmarking) return
    bookmarkPost()
  }

  return (
    <article className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 p-6 group border-b border-slate-200 dark:border-slate-700">
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <Link to={`/profile/${postOwner.username}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-md hover:ring-blue-200 dark:hover:ring-blue-500 transition-all duration-200">
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
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {postOwner.fullName}
            </Link>
            <Link
              to={`/profile/${postOwner.username}`}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              @{postOwner.username}
            </Link>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">{formattedDate}</span>
            {post.autoFlagged && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse">
                Auto-flagged
              </span>
            )}

            {isMyPost && (
              <div className="ml-auto flex gap-2">
                {isTogglingNsfw ? (
                  <div className="p-2 rounded-full flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <button
                    onClick={() => toggleNsfw()}
                    className={`p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                      post.isNSFW
                        ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        : "text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    }`}
                    title={post.isNSFW ? "Mark as Safe" : "Mark as NSFW"}
                    disabled={isTogglingNsfw}
                  >
                    <span className="text-xs font-bold">NSFW</span>
                  </button>
                )}
                {!isUpdating && (
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                )}
                {!isDeleting ? (
                  <button
                    onClick={handleDeletePost}
                    className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
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
            {!isMyPost && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setReportModalData({
                    isOpen: true,
                    reportedUser: postOwner._id,
                    reportType: "post",
                    targetId: post._id
                  })}
                  className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Report Post"
                >
                  <FaFlag className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Edit Mode */}
          {editMode ? (
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                rows={4}
              />
              {editImg && (
                <div className="mt-3 mb-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                  <img src={editImg} alt="Post" className="w-full h-auto" />
                </div>
              )}
              <div className="flex gap-2 justify-end mt-3">
                <button
                  onClick={() => {
                    setEditMode(false)
                    setEditText(post.text)
                    setEditImg(post.img)
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-full font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? <LoadingSpinner size="sm" /> : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Post Text */}
              {post.text && (
                <p className="text-slate-800 dark:text-slate-100 leading-relaxed mb-4">
                  {(post.isNSFW || post.isBlurred) && (
                    <span className="text-red-500 font-bold mr-2">[NSFW]</span>
                  )}
                  {post.text}
                </p>
              )}

              {/* Post Image */}
              {post.img && (
                <div className="relative mb-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={post.img}
                    className={`w-full h-auto object-cover transition-all duration-300 ${(post.isNSFW || post.isBlurred) && !showNsfw ? "blur-[12px] select-none" : ""}`}
                    alt="Post content"
                  />
                  {(post.isNSFW || post.isBlurred) && !showNsfw && (
                    <div
                      onClick={() => setShowNsfw(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 cursor-pointer transition-all hover:bg-black/70 z-10"
                    >
                      <span className="text-white font-bold text-sm bg-red-600/90 px-4 py-2 rounded-full shadow-lg border border-red-500 animate-pulse">
                        NSFW — Tap to reveal
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Hide Button for NSFW */}
              {(post.isNSFW || post.isBlurred) && showNsfw && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowNsfw(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Hide NSFW Content
                  </button>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-8">
              {/* Comments */}
              <button
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group/comment"
                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
              >
                <div className="p-2 rounded-full group-hover/comment:bg-blue-50 dark:group-hover/comment:bg-blue-900/30 transition-colors">
                  <FaRegComment className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{post.comments.length}</span>
              </button>

              {/* Repost */}
              <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors group/repost">
                <div className="p-2 rounded-full group-hover/repost:bg-green-50 dark:group-hover/repost:bg-green-900/30 transition-colors">
                  <BiRepost className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">0</span>
              </button>

              {/* Like */}
              <button
                onClick={handleLikePost}
                className={`flex items-center gap-2 transition-colors group/like ${
                  isLiked ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                }`}
                disabled={isLiking}
              >
                <div className="p-2 rounded-full group-hover/like:bg-red-50 dark:group-hover/like:bg-red-900/30 transition-colors">
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
            <button
              onClick={handleBookmarkPost}
              disabled={isBookmarking}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? "text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              }`}
            >
              {isBookmarking ? <LoadingSpinner size="sm" /> : isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <dialog id={`comments_modal${post._id}`} className="modal">
        <div className="modal-box bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Comments</h3>
            <form method="dialog">
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span className="text-slate-500 dark:text-slate-400">✕</span>
              </button>
            </form>
          </div>

          <div className="space-y-4 max-h-60 overflow-auto mb-6">
            {post.comments.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 dark:from-blue-900/40 to-purple-100 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">💬</div>
                </div>
                <p className="text-slate-500 dark:text-slate-400">No comments yet. Be the first to comment!</p>
              </div>
            )}

            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={comment.user.profileImage || "/avatar-placeholder.png"}
                    alt={`${comment.user.fullName}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{comment.user.fullName}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">@{comment.user.username}</span>
                    {comment.user._id !== authUser._id && (
                      <button
                        onClick={() => setReportModalData({
                          isOpen: true,
                          reportedUser: comment.user._id,
                          reportType: "comment",
                          targetId: comment._id
                        })}
                        className="ml-auto text-xs text-rose-500 hover:underline transition-all cursor-pointer font-bold"
                      >
                        Report
                      </button>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handlePostComment} className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={authUser?.profileImage || "/avatar-placeholder.png"}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600 focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
                  <textarea
                    className="w-full text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none border-none focus:outline-none bg-transparent"
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
      <ReportModal
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData(prev => ({ ...prev, isOpen: false }))}
        reportedUser={reportModalData.reportedUser}
        reportType={reportModalData.reportType}
        targetId={reportModalData.targetId}
      />
    </article>
  )
}

export default Post
