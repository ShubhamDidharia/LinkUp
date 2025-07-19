"use client"

import { Link } from "react-router-dom"
import { useState } from "react"
import XSvg from "../../../components/svgs/X"
import { MdOutlineMail } from "react-icons/md"
import { FaUser } from "react-icons/fa"
import { MdPassword } from "react-icons/md"
import { MdDriveFileRenameOutline } from "react-icons/md"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  })

  const queryClient = useQueryClient()
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
      return data
    },
    onSuccess: () => {
      toast.success("Account created")
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault() // page won't reload
    mutate(formData)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-screen-xl mx-auto flex min-h-screen">
        {/* Left Side - Logo */}
        <div className="flex-1 hidden lg:flex items-center justify-center p-12">
          <div className="text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl mb-8 inline-block">
              <XSvg className="w-24 h-24 fill-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Join our community!</h2>
            <p className="text-xl text-slate-600">Create your account and start connecting with others</p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg mb-4 inline-block">
                  <XSvg className="w-12 h-12 fill-white" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Create account</h1>
                <p className="text-slate-600">Join us today and start your journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MdOutlineMail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Username and Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                        placeholder="Username"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MdDriveFileRenameOutline className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                        placeholder="Full name"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MdPassword className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {isError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isPending ? "Creating account..." : "Create account"}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600 mb-4">Already have an account?</p>
                <Link to="/login">
                  <button className="w-full py-3 px-4 border-2 border-purple-500 text-purple-500 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200">
                    Sign in
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
