"use client"

import { useState } from "react"
import Posts from "../../components/common/Posts"
import CreatePost from "./CreatePost"

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou")

  return (
    <div className="flex-1 bg-[#0D0D0D] min-h-screen border-x border-[#2A2A2A] transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#111111]/95 backdrop-blur-md border-b border-[#2A2A2A] transition-colors">
        <div className="flex">
          <button
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 relative ${
              feedType === "forYou"
                ? "text-[#E8450A] bg-[#2A2A10]"
                : "text-slate-500 hover:text-white hover:bg-[#1A1A1A]"
            }`}
            onClick={() => setFeedType("forYou")}
          >
            For You
            {feedType === "forYou" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-[#E8450A]" />
            )}
          </button>
          <button
            className={`flex-1 py-4 px-6 font-semibold transition-all duration-200 relative ${
              feedType === "following"
                ? "text-[#E8450A] bg-[#2A2A10]"
                : "text-slate-500 hover:text-white hover:bg-[#1A1A1A]"
            }`}
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-[#E8450A]" />
            )}
          </button>
        </div>
      </div>

      {/* Create Post Section */}
      <div className="bg-[#111111] border-b border-[#2A2A2A] transition-colors">
        <CreatePost />
      </div>

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </div>
  )
}

export default HomePage
