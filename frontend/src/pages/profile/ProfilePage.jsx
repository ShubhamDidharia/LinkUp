"use client"

import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import Posts from "../../components/common/Posts"
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton"
import EditProfileModal from "./EditProfileModal"
import { POSTS } from "../../utils/db/dummy"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { FaArrowLeft, FaCamera, FaUserPlus, FaUserMinus } from "react-icons/fa"
import { IoCalendarOutline } from "react-icons/io5"
import { FaLink } from "react-icons/fa"
import { MdEdit, MdVerified } from "react-icons/md"
import { useQuery } from "@tanstack/react-query"
import { formatMemberSinceDate } from "../../utils/date"
import useFollow from "../../hooks/useFollow"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null)
  const [profileImg, setProfileImg] = useState(null)
  const [feedType, setFeedType] = useState("posts")
  const coverImgRef = useRef(null)
  const profileImgRef = useRef(null)
  const queryClient = useQueryClient()
  const { follow, isPending } = useFollow()
  const { username } = useParams()
  const { data: authUser } = useQuery({ queryKey: ["authUser"] })
  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`)
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
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coverImage: coverImg, profileImage: profileImg }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to update profile")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully")
      // invalidate queries to fetch updated user data after updating
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ])
    },
  })
  // call refetch whenever username changes in url
  useEffect(() => {
    refetch()
  }, [username, refetch])

  const amIFollowing = authUser?.following.includes(user?._id)
  const isMyProfile = authUser?._id === user?._id

  const handleImgChange = (e, state) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result)
        state === "profileImg" && setProfileImg(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex-[4_4_0] bg-gradient-to-b from-slate-50 to-white min-h-screen border-x border-slate-200">
      {/* HEADER */}
      {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
      {!isLoading && !isRefetching && !user && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <div className="text-5xl">😕</div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">User not found</h3>
          <p className="text-slate-500 text-lg">The profile you're looking for doesn't exist.</p>
        </div>
      )}

      <div className="flex flex-col">
        {!isLoading && !isRefetching && user && (
          <>
            {/* Enhanced Navigation Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
              <div className="flex gap-6 px-6 py-4 items-center">
                <Link
                  to="/"
                  className="p-3 rounded-full hover:bg-slate-100 transition-all duration-200 hover:scale-105"
                >
                  <FaArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-xl text-slate-900">{user?.fullName}</h1>
                    <MdVerified className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">{POSTS?.length} posts</span>
                </div>
              </div>
            </div>

            {/* Enhanced Cover Image Section */}
            <div className="relative group/cover">
              <div className="h-80 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
                <img
                  src={coverImg || user?.coverImage || "/cover.png"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                  alt="cover image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {isMyProfile && (
                <div
                  className="absolute top-6 right-6 rounded-full p-4 bg-black/60 backdrop-blur-md cursor-pointer opacity-0 group-hover/cover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-110"
                  onClick={() => coverImgRef.current.click()}
                >
                  <FaCamera className="w-5 h-5 text-white" />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                hidden
                ref={coverImgRef}
                onChange={(e) => handleImgChange(e, "coverImg")}
              />
              <input
                type="file"
                accept="image/*"
                hidden
                ref={profileImgRef}
                onChange={(e) => handleImgChange(e, "profileImg")}
              />

              {/* Enhanced Profile Avatar */}
              <div className="absolute -bottom-20 left-8">
                <div className="w-40 h-40 rounded-full relative group/avatar ring-6 ring-white shadow-2xl bg-white">
                  <img
                    src={profileImg || user?.profileImage || "/avatar-placeholder.png"}
                    className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                    alt="profile"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
                  {isMyProfile && (
                    <div className="absolute bottom-3 right-3 p-3 bg-blue-500 rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer transition-all duration-300 hover:bg-blue-600 shadow-xl hover:scale-110">
                      <FaCamera className="w-4 h-4 text-white" onClick={() => profileImgRef.current.click()} />
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons Section */}
            <div className="flex justify-end px-8 mt-8 gap-4">
              {isMyProfile && (
                <div className="flex gap-3">
                  <EditProfileModal authUser={authUser} />
                  {(coverImg || profileImg) && (
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                      onClick={() => updateProfile()}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <MdEdit className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              {!isMyProfile && (
                <button
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                    amIFollowing
                      ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border-2 border-slate-300 hover:border-red-300"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  }`}
                  onClick={() => follow(user._id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : amIFollowing ? (
                    <>
                      <FaUserMinus className="w-4 h-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Enhanced User Info Section */}
            <div className="px-8 mt-20 mb-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 backdrop-blur-sm">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-bold text-3xl text-slate-900">{user?.fullName}</h2>
                      <MdVerified className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-slate-500 text-xl font-medium">@{user?.username}</p>
                    {user?.bio && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-700 leading-relaxed text-lg">{user?.bio}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-8 flex-wrap">
                    {user?.link && (
                      <div className="flex gap-3 items-center group p-3 rounded-xl hover:bg-blue-50 transition-colors">
                        <FaLink className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <a
                          href="https://youtube.com/@asaprogrammer_"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:text-blue-600 hover:underline transition-colors font-medium"
                        >
                          youtube.com/@asaprogrammer_
                        </a>
                      </div>
                    )}
                    <div className="flex gap-3 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <IoCalendarOutline className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600 font-medium">
                        Joined {formatMemberSinceDate(user?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-12 pt-4 border-t border-slate-200">
                    <div className="flex gap-3 items-center group cursor-pointer">
                      <span className="font-bold text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">
                        {user?.following.length}
                      </span>
                      <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                        Following
                      </span>
                    </div>
                    <div className="flex gap-3 items-center group cursor-pointer">
                      <span className="font-bold text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">
                        {user?.followers.length}
                      </span>
                      <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                        Followers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="sticky top-[73px] z-10 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
              <div className="flex px-8">
                <button
                  className={`flex-1 py-5 px-8 font-semibold transition-all duration-200 relative ${
                    feedType === "posts"
                      ? "text-blue-600 bg-blue-50/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                </button>
                <button
                  className={`flex-1 py-5 px-8 font-semibold transition-all duration-200 relative ${
                    feedType === "likes"
                      ? "text-blue-600 bg-blue-50/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Posts Section */}
        {!isLoading && !isRefetching && user && (
          <div className="bg-white">
            <Posts feedType={feedType} username={username} userId={user._id} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
