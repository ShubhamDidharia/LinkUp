"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { useEffect } from "react"
import { MdEdit, MdClose } from "react-icons/md"
import { FaUser, FaEnvelope, FaLock, FaLink } from "react-icons/fa"
import { BsTextareaResize } from "react-icons/bs"

const EditProfileModal = ({ authUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  })

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const queryClient = useQueryClient()

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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
      // Close modal after successful update
      document.getElementById("edit_profile_modal").close()
    },
  })

  useEffect(() => {
    setFormData({
      fullName: authUser?.fullName || "",
      username: authUser?.username || "",
      email: authUser?.email || "",
      bio: authUser?.bio || "",
      link: authUser?.link || "",
      newPassword: "",
      currentPassword: "",
    })
  }, [authUser])

  return (
    <>
      <button
        className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        onClick={() => document.getElementById("edit_profile_modal").showModal()}
      >
        <MdEdit className="w-4 h-4" />
        Edit profile
      </button>

      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl p-0 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Edit Profile</h3>
                <p className="text-slate-600 mt-1">Update your personal information</p>
              </div>
              <form method="dialog">
                <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                  <MdClose className="w-6 h-6 text-slate-500" />
                </button>
              </form>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 pb-6">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                updateProfile()
              }}
            >
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FaUser className="w-4 h-4 text-blue-500" />
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                        value={formData.fullName}
                        name="fullName"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your username"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                        value={formData.username}
                        name="username"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                      value={formData.email}
                      name="email"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                  <div className="relative">
                    <div className="absolute top-3 left-4 pointer-events-none">
                      <BsTextareaResize className="h-4 w-4 text-slate-400" />
                    </div>
                    <textarea
                      placeholder="Tell us about yourself..."
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500 resize-none"
                      value={formData.bio}
                      name="bio"
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLink className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://your-website.com"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                      value={formData.link}
                      name="link"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FaLock className="w-4 h-4 text-blue-500" />
                  Security
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                        value={formData.currentPassword}
                        name="currentPassword"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                        value={formData.newPassword}
                        name="newPassword"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Leave password fields empty if you don't want to change your password.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200 sticky bottom-0 bg-white">
                <form method="dialog" className="flex-1">
                  <button
                    type="button"
                    className="w-full py-3 px-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </form>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <MdEdit className="w-4 h-4" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}

export default EditProfileModal
