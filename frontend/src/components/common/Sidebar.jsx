"use client"

import XSvg from "../svgs/X"
import { MdHomeFilled, MdSearch, MdShield } from "react-icons/md"
import { IoSettingsOutline } from "react-icons/io5"
import { FaUser } from "react-icons/fa"
import { FaBookmark } from "react-icons/fa6"
import { Link, useLocation } from "react-router-dom"
import { BiLogOut } from "react-icons/bi"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import ThemeSlider from "./ThemeSlider"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const location = useLocation()

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (!res.ok) throw new Error("Failed to logout")
      // Clear cached authUser
      queryClient.setQueryData(["authUser"], null)
      toast.success("Logged out successfully")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const authUser = queryClient.getQueryData(["authUser"])
  const data = {
    fullName: authUser?.fullName,
    username: authUser?.username,
    profileImg: authUser?.profileImage,
  }

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    {
      path: "/",
      icon: MdHomeFilled,
      label: "Home",
      iconSize: "w-7 h-7",
    },

    {
      path: "/search",
      icon: MdSearch,
      label: "Search",
      iconSize: "w-6 h-6",
    },
    {
      path: "/bookmarks",
      icon: FaBookmark,
      label: "Bookmarks",
      iconSize: "w-6 h-6",
    },
    {
      path: "/settings",
      icon: IoSettingsOutline,
      label: "Settings",
      iconSize: "w-6 h-6",
    },
  ]

  if (authUser?.role === "admin") {
    navItems.push({
      path: "/admin",
      icon: MdShield,
      label: "Admin Panel",
      iconSize: "w-6 h-6",
    })
  }

  return (
    <div className="flex-1 w-20 md:w-64 max-w-64 mr-4">
      <div className="fixed top-0 left-0 h-screen flex flex-col w-20 md:w-64 bg-[#111111] border-r border-[#2A2A2A] shadow-sm z-30 transition-colors duration-200">
        {/* Logo Section */}
        <div className="p-4 md:p-6">
          <Link to="/" className="flex justify-center md:justify-start group">
            <div className="p-2 rounded-2xl border border-[#2A2A2A] bg-transparent transition-all duration-200 group-hover:border-[#E8450A] group-hover:scale-105">
              <XSvg className="w-8 h-8 text-[#E8450A]" />
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 md:px-4">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path)

              if (item.isCustom) {
                return (
                  <li key={item.path}>
                    <div
                       className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                         active
                          ? "bg-[#2A2A10] text-[#E8450A] shadow-sm"
                          : "text-slate-500 hover:bg-[#1A1A1A] hover:text-white"
                      }`}
                    >
                      <div className="flex justify-center md:justify-start flex-1">
                        <item.component />
                      </div>
                      <span
                        className={`text-lg font-medium hidden md:block ${active ? "text-[#E8450A]" : "text-slate-400"}`}
                      >
                        {item.label}
                      </span>
                      {active && (
                        <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full hidden md:block"></div>
                      )}
                    </div>
                  </li>
                )
              }

              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                   className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                     active
                      ? "bg-[#2A2A10] text-[#E8450A] shadow-sm"
                      : "text-slate-500 hover:bg-[#1A1A1A] hover:text-white"
                    }`}
                  >
                    <div className="flex justify-center md:justify-start">
                      <Icon
                        className={`${item.iconSize} ${active ? "text-[#E8450A]" : "text-slate-500 group-hover:text-slate-200"}`}
                      />
                    </div>
                    <span
                      className={`text-lg font-medium hidden md:block ${active ? "text-[#E8450A]" : "text-slate-400"}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="px-3 md:px-4 pb-2">
          <div className="flex justify-center md:justify-start">
            <ThemeSlider />
          </div>
        </div>

        {/* User Profile Section */}
        {data && (
          <div className="p-3 md:p-4 border-t border-[#2A2A2A]">
            <div className="bg-[#111111] rounded-2xl p-3 md:p-4 transition-colors duration-200 border border-[#2A2A2A]">
              <Link to={`/profile/${data.username}`} className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-[#2A2A2A] shadow-md transition-all duration-200">
                    <img
                      src={data?.profileImg || "/avatar-placeholder.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-600"></div>
                </div>

                <div className="flex-1 hidden md:block">
                  <p className="text-white font-semibold text-sm truncate group-hover:text-[#E8450A] transition-colors">
                    {data?.fullName}
                  </p>
                  <p className="text-slate-500 text-xs truncate">@{data?.username}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    logout()
                  }}
                  className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 group/logout"
                  title="Logout"
                >
                  <BiLogOut className="w-5 h-5 group-hover/logout:scale-110 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Decoration */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </div>
    </div>
  )
}


export default Sidebar
