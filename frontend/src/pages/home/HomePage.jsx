"use client"

import { useState } from "react"
import Posts from "../../components/common/Posts"
import CreatePost from "./CreatePost"

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou")

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 dark:from-slate-900/50 to-white dark:to-slate-900 min-h-screen border-x border-slate-200 dark:border-slate-700 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 relative ${
              feedType === "forYou"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
            onClick={() => setFeedType("forYou")}
          >
            For You
            {feedType === "forYou" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-blue-500 dark:bg-blue-400" />
            )}
          </button>
          <button
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 relative ${
              feedType === "following"
                ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-blue-500 dark:bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Create Post Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors">
        <CreatePost />
      </div>

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </div>
  )
}

export default HomePage
