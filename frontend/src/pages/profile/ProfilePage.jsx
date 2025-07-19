"use client"

import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import Posts from "../../components/common/Posts"
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton"
import EditProfileModal from "./EditProfileModal"
import { POSTS } from "../../utils/db/dummy"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { FaArrowLeft } from "react-icons/fa6"
import { IoCalendarOutline } from "react-icons/io5"
import { FaLink } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
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
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <div className="text-3xl">😕</div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">User not found</h3>
          <p className="text-slate-500">The profile you're looking for doesn't exist.</p>
        </div>
      )}

      <div className="flex flex-col">
        {!isLoading && !isRefetching && user && (
          <>
            {/* Navigation Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
              <div className="flex gap-6 px-6 py-4 items-center">
                <Link to="/" className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200">
                  <FaArrowLeft className="w-4 h-4 text-slate-700" />
                </Link>
                <div className="flex flex-col">
                  <h1 className="font-bold text-xl text-slate-900">{user?.fullName}</h1>
                  <span className="text-sm text-slate-500">{POSTS?.length} posts</span>
                </div>
              </div>
            </div>

            {/* Cover Image Section */}
            <div className="relative group/cover">
              <div className="h-64 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
                <img
                  src={coverImg || user?.coverImage || "/cover.png"}
                  className="h-full w-full object-cover"
                  alt="cover image"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {isMyProfile && (
                <div
                  className="absolute top-4 right-4 rounded-full p-3 bg-black/50 backdrop-blur-sm cursor-pointer opacity-0 group-hover/cover:opacity-100 transition-all duration-200 hover:bg-black/60"
                  onClick={() => coverImgRef.current.click()}
                >
                  <MdEdit className="w-5 h-5 text-white" />
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

              {/* Profile Avatar */}
              <div className="absolute -bottom-16 left-6">
                <div className="w-32 h-32 rounded-full relative group/avatar ring-4 ring-white shadow-xl bg-white">
                  <img
                    src={profileImg || user?.profileImage || "/avatar-placeholder.png"}
                    className="w-full h-full rounded-full object-cover"
                    alt="profile"
                  />
                  {isMyProfile && (
                    <div className="absolute bottom-2 right-2 p-2 bg-blue-500 rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer transition-all duration-200 hover:bg-blue-600 shadow-lg">
                      <MdEdit className="w-4 h-4 text-white" onClick={() => profileImgRef.current.click()} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end px-6 mt-6 gap-3">
              {isMyProfile && <EditProfileModal authUser={authUser} />}
              {!isMyProfile && (
                <button
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    amIFollowing
                      ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-300"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
                  }`}
                  onClick={() => follow(user._id)}
                  disabled={isPending}
                >
                  {isPending && "Loading..."}
                  {!isPending && amIFollowing && "Unfollow"}
                  {!isPending && !amIFollowing && "Follow"}
                </button>
              )}
              {(coverImg || profileImg) && (
                <button
                  className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  onClick={() => updateProfile()}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Updating..." : "Update"}
                </button>
              )}
            </div>

            {/* User Info Section */}
            <div className="px-6 mt-16 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h2 className="font-bold text-2xl text-slate-900">{user?.fullName}</h2>
                    <p className="text-slate-500 text-lg">@{user?.username}</p>
                    {user?.bio && <p className="text-slate-700 mt-3 leading-relaxed">{user?.bio}</p>}
                  </div>

                  <div className="flex gap-6 flex-wrap">
                    {user?.link && (
                      <div className="flex gap-2 items-center group">
                        <FaLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <a
                          href="https://youtube.com/@asaprogrammer_"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                        >
                          youtube.com/@asaprogrammer_
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <IoCalendarOutline className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Joined {formatMemberSinceDate(user?.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <div className="flex gap-2 items-center">
                      <span className="font-bold text-lg text-slate-900">{user?.following.length}</span>
                      <span className="text-slate-500">Following</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-bold text-lg text-slate-900">{user?.followers.length}</span>
                      <span className="text-slate-500">Followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-[73px] z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
              <div className="flex">
                <button
                  className={`flex-1 py-4 px-6 font-medium transition-all duration-200 relative ${
                    feedType === "posts"
                      ? "text-blue-600 bg-blue-50/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-blue-500" />
                  )}
                </button>
                <button
                  className={`flex-1 py-4 px-6 font-medium transition-all duration-200 relative ${
                    feedType === "likes"
                      ? "text-blue-600 bg-blue-50/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-blue-500" />
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
