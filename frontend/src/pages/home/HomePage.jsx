"use client"

import { useState } from "react"
import Posts from "../../components/common/Posts"
import CreatePost from "./CreatePost"

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou")

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white min-h-screen border-x border-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 relative ${
              feedType === "forYou"
                ? "text-blue-600 bg-blue-50/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            onClick={() => setFeedType("forYou")}
          >
            For You
            {feedType === "forYou" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-blue-500" />
            )}
          </button>
          <button
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 relative ${
              feedType === "following"
                ? "text-blue-600 bg-blue-50/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* Create Post Section */}
      <div className="bg-white border-b border-slate-100">
        <CreatePost />
      </div>

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </div>
  )
}

export default HomePage
