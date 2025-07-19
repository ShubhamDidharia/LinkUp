"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import XSvg from "../../../components/svgs/X"
import { MdOutlineMail } from "react-icons/md"
import { MdPassword } from "react-icons/md"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const queryClient = useQueryClient()

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      // refetch the authUser
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation(formData)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-screen-xl mx-auto flex min-h-screen">
        {/* Left Side - Logo */}
        <div className="flex-1 hidden lg:flex items-center justify-center p-12">
          <div className="text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl mb-8 inline-block">
              <XSvg className="w-24 h-24 fill-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Welcome back!</h2>
            <p className="text-xl text-slate-600">Connect with friends and share your moments</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4 inline-block">
                  <XSvg className="w-12 h-12 fill-white" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h1>
                <p className="text-slate-600">Welcome back! Please sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MdOutlineMail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                      placeholder="Enter your username"
                      required
                    />
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
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-500"
                      placeholder="Enter your password"
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
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isPending ? "Signing in..." : "Sign in"}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-slate-600 mb-4">Don't have an account?</p>
                <Link to="/signup">
                  <button className="w-full py-3 px-4 border-2 border-blue-500 text-blue-500 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200">
                    Create account
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

export default LoginPage
