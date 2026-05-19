"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MdEdit } from "react-icons/md"
import { FaUser, FaEnvelope, FaLock, FaLink } from "react-icons/fa"
import { BsTextareaResize } from "react-icons/bs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const EditProfileModal = ({ authUser }) => {
  const [open, setOpen] = useState(false)
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
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ])
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full shadow-sm hover:shadow-md flex items-center gap-2">
          <MdEdit className="w-4 h-4" />
          Edit profile
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mt-6 px-6 py-6 border-b border-slate-100">
          <DialogTitle className="text-2xl font-bold text-slate-900">Edit Profile</DialogTitle>
          <DialogDescription className="text-slate-600 mt-1">
            Update your personal information
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6 py-6"
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
                    <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      name="fullName"
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700 mb-2">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      name="username"
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2">
                    Email
                  </Label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      name="email"
                      onChange={handleInputChange}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium text-slate-700 mb-2">
                    Bio
                  </Label>
                  <div className="relative">
                    <BsTextareaResize className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      name="bio"
                      onChange={handleInputChange}
                      rows={3}
                      className="pl-10 rounded-xl resize-none"
                    />
                  </div>
                </div>

                {/* Link */}
                <div>
                  <Label htmlFor="link" className="text-sm font-medium text-slate-700 mb-2">
                    Website
                  </Label>
                  <div className="relative">
                    <FaLink className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://your-website.com"
                      value={formData.link}
                      name="link"
                      onChange={handleInputChange}
                      className="pl-10 rounded-xl"
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
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 mb-2">
                      Current Password
                    </Label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        name="currentPassword"
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700 mb-2">
                      New Password
                    </Label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        name="newPassword"
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl"
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
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
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
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )
}

export default EditProfileModal
