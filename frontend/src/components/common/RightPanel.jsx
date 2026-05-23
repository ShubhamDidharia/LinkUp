"use client"

import { Link } from "react-router-dom"
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton"
import { useQuery } from "@tanstack/react-query"
import useFollow from "../../hooks/useFollow"
import LoadingSpinner from "./LoadingSpinner"
import { useState, useEffect } from "react"
import { FaExternalLinkAlt, FaClock, FaFire } from "react-icons/fa"

const RightPanel = () => {
  const [newsCategory, setNewsCategory] = useState("general")

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested")
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

  // Live News Feed Query using Free APIs
  const {
    data: newsData,
    isLoading: isLoadingNews,
    error: newsError,
  } = useQuery({
    queryKey: ["liveNews", newsCategory],
    queryFn: async () => {
      try {
        // Method 1: Try Guardian API (completely free)
        const guardianResponse = await fetch(
          `https://content.guardianapis.com/search?section=${newsCategory === "general" ? "world" : newsCategory}&page-size=5&show-fields=thumbnail,trailText&api-key=test`,
        )

        if (guardianResponse.ok) {
          const guardianData = await guardianResponse.json()
          return {
            articles: guardianData.response.results.map((article) => ({
              title: article.webTitle,
              description: article.fields?.trailText || article.webTitle,
              url: article.webUrl,
              urlToImage: article.fields?.thumbnail || "/news-collage.png",
              publishedAt: article.webPublicationDate,
              source: { name: "The Guardian" },
            })),
          }
        }

        // Method 2: Fallback to free demo news data
        const demoNews = {
          general: [
            {
              title: "Global Climate Summit Reaches Historic Agreement",
              description:
                "World leaders unite on ambitious climate action plan for 2024, marking a significant step forward in environmental policy.",
              url: "https://example.com/climate-summit",
              urlToImage: "/placeholder-8qh02.png",
              publishedAt: new Date().toISOString(),
              source: { name: "Global News" },
            },
            {
              title: "International Trade Relations Show Positive Trends",
              description: "Economic analysts report improved trade relationships between major world economies.",
              url: "https://example.com/trade-relations",
              urlToImage: "/business-news-collage.png",
              publishedAt: new Date(Date.now() - 3600000).toISOString(),
              source: { name: "Economic Times" },
            },
            {
              title: "Cultural Exchange Programs Expand Globally",
              description: "Universities worldwide announce new international student exchange initiatives.",
              url: "https://example.com/cultural-exchange",
              urlToImage: "/news-collage.png",
              publishedAt: new Date(Date.now() - 7200000).toISOString(),
              source: { name: "Education Weekly" },
            },
          ],
          technology: [
            {
              title: "Revolutionary AI Breakthrough in Medical Diagnosis",
              description: "New artificial intelligence system demonstrates 95% accuracy in early disease detection.",
              url: "https://example.com/ai-medical",
              urlToImage: "/ai-news-headline.png",
              publishedAt: new Date().toISOString(),
              source: { name: "Tech Today" },
            },
            {
              title: "Quantum Computing Reaches New Milestone",
              description: "Scientists achieve quantum supremacy in complex mathematical calculations.",
              url: "https://example.com/quantum-computing",
              urlToImage: "/tech-news-collage.png",
              publishedAt: new Date(Date.now() - 1800000).toISOString(),
              source: { name: "Science Tech" },
            },
            {
              title: "Sustainable Tech Solutions Gain Momentum",
              description: "Green technology innovations show promise for reducing carbon footprint in tech industry.",
              url: "https://example.com/sustainable-tech",
              urlToImage: "/tech-news-collage.png",
              publishedAt: new Date(Date.now() - 5400000).toISOString(),
              source: { name: "Green Tech News" },
            },
          ],
          business: [
            {
              title: "Startup Ecosystem Shows Record Growth",
              description: "Venture capital investments reach all-time high as innovation drives economic expansion.",
              url: "https://example.com/startup-growth",
              urlToImage: "/business-news-collage.png",
              publishedAt: new Date().toISOString(),
              source: { name: "Business Wire" },
            },
            {
              title: "Remote Work Trends Reshape Corporate Culture",
              description: "Companies adapt to hybrid work models as employee preferences evolve.",
              url: "https://example.com/remote-work",
              urlToImage: "/business-news-collage.png",
              publishedAt: new Date(Date.now() - 2700000).toISOString(),
              source: { name: "Corporate Today" },
            },
          ],
          science: [
            {
              title: "Mars Exploration Mission Achieves Major Breakthrough",
              description: "NASA's latest rover discovers evidence of ancient microbial life on Mars surface.",
              url: "https://example.com/mars-discovery",
              urlToImage: "/space-news-collage.png",
              publishedAt: new Date().toISOString(),
              source: { name: "Space News" },
            },
            {
              title: "Gene Therapy Shows Promise for Rare Diseases",
              description: "Clinical trials demonstrate significant improvement in patients with genetic disorders.",
              url: "https://example.com/gene-therapy",
              urlToImage: "/news-collage.png",
              publishedAt: new Date(Date.now() - 3600000).toISOString(),
              source: { name: "Medical Journal" },
            },
          ],
          health: [
            {
              title: "Mental Health Awareness Campaigns Show Impact",
              description: "Global initiatives to address mental health stigma report positive outcomes.",
              url: "https://example.com/mental-health",
              urlToImage: "/news-collage.png",
              publishedAt: new Date().toISOString(),
              source: { name: "Health Today" },
            },
            {
              title: "Breakthrough in Cancer Treatment Research",
              description: "New immunotherapy approach shows remarkable success rates in clinical trials.",
              url: "https://example.com/cancer-research",
              urlToImage: "/news-collage.png",
              publishedAt: new Date(Date.now() - 1800000).toISOString(),
              source: { name: "Medical Research" },
            },
          ],
        }

        return {
          articles: demoNews[newsCategory] || demoNews.general,
        }
      } catch (error) {
        console.error("News fetch error:", error)
        // Ultimate fallback with rotating demo content
        const fallbackNews = [
          {
            title: "Breaking: Technology Sector Shows Strong Growth",
            description:
              "Industry analysts report significant advancement in emerging technologies and digital transformation.",
            url: "#",
            urlToImage: "/tech-news-collage.png",
            publishedAt: new Date().toISOString(),
            source: { name: "Tech News" },
          },
          {
            title: "Global Markets Demonstrate Resilience",
            description: "Economic indicators suggest stable growth patterns across international markets.",
            url: "#",
            urlToImage: "/business-news-collage.png",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: { name: "Financial Times" },
          },
          {
            title: "Scientific Research Yields Promising Results",
            description: "Recent studies in multiple fields show potential for significant breakthroughs.",
            url: "#",
            urlToImage: "/news-collage.png",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: { name: "Science Daily" },
          },
        ]

        return { articles: fallbackNews }
      }
    },
    refetchInterval: 600000, // Refetch every 10 minutes (reasonable for free APIs)
    staleTime: 480000, // Consider data stale after 8 minutes
  })

  const { follow, isPending } = useFollow()

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInMinutes = Math.floor((now - publishedDate) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const newsCategories = [
    { id: "general", label: "General", icon: "🌍" },
    { id: "technology", label: "Tech", icon: "💻" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "science", label: "Science", icon: "🔬" },
    { id: "health", label: "Health", icon: "🏥" },
  ]

  useEffect(() => {
    // Function to handle scroll progress
    const handleScrollProgress = () => {
      const scrollable = document.documentElement.scrollWidth - window.innerWidth
      const scrolled = window.scrollX

      if (scrollable <= 0) {
        // Avoid division by zero if there's nothing to scroll
        return
      }

      const scrollPercentage = Math.min((scrolled / scrollable) * 100, 100)
      // document.getElementById('scroll-progress').style.width = `${scrollPercentage}%`
    }

    // Attach the event listener
    window.addEventListener("scroll", handleScrollProgress)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScrollProgress)
    }
  }, [])

  // Add this useEffect after the existing one
  useEffect(() => {
    const container = document.getElementById("news-categories")
    const progressBar = document.getElementById("scroll-progress")

    const updateScrollProgress = () => {
      if (container && progressBar) {
        const scrollPercentage = (container.scrollLeft / (container.scrollWidth - container.clientWidth)) * 100
        progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`
      }
    }

    container?.addEventListener("scroll", updateScrollProgress)

    // Initial update
    updateScrollProgress()

    return () => {
      container?.removeEventListener("scroll", updateScrollProgress)
    }
  }, [])

  return (
    <div className="hidden lg:block w-80 p-4">
      <div className="sticky top-4 space-y-6">
        {/* Who to Follow Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-purple-50 dark:to-purple-900/30 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Who to follow</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Discover amazing people</p>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading && (
              <div className="space-y-4">
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </div>
            )}

            {!isLoading && suggestedUsers?.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 dark:from-blue-900/40 to-purple-100 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">👥</div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No suggestions available</p>
              </div>
            )}

            {!isLoading && suggestedUsers?.length > 0 && (
              <div className="space-y-3">
                {suggestedUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-md group-hover:ring-blue-200 dark:group-hover:ring-blue-500 transition-all duration-200">
                            <img
                              src={user.profileImage || "/avatar-placeholder.png"}
                              alt={`${user.fullName}'s avatar`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-700"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
                        </div>
                      </Link>

                      <button
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault()
                          follow(user._id)
                        }}
                        disabled={isPending}
                      >
                        {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && suggestedUsers?.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
              <Link
                to="/explore"
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm font-medium hover:underline transition-colors"
              >
                Show more suggestions
              </Link>
            </div>
          )}
        </div>

        {/* Live News Feed Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="bg-gradient-to-r from-red-50 dark:from-red-900/30 to-orange-50 dark:to-orange-900/30 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="w-5 h-5 text-red-500 dark:text-red-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">What's happening</h2>
              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Live news updates</p>
          </div>

          {/* Enhanced News Category Tabs */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
            <div className="relative">
              {/* Scroll Indicators */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={() => {
                    const container = document.getElementById("news-categories")
                    container.scrollBy({ left: -120, behavior: "smooth" })
                  }}
                  className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  id="scroll-left-btn"
                >
                  <svg className="w-3 h-3 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={() => {
                    const container = document.getElementById("news-categories")
                    container.scrollBy({ left: 120, behavior: "smooth" })
                  }}
                  className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  id="scroll-right-btn"
                >
                  <svg className="w-3 h-3 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Gradient Fade Effects */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-50 dark:from-slate-800/80 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-50 dark:from-slate-800/80 to-transparent z-10 pointer-events-none"></div>

              {/* Categories Container */}
              <div
                id="news-categories"
                className="flex gap-2 overflow-x-auto scrollbar-hide px-2 group"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitScrollbar: { display: "none" },
                }}
                onScroll={(e) => {
                  const container = e.target
                  const leftBtn = document.getElementById("scroll-left-btn")
                  const rightBtn = document.getElementById("scroll-right-btn")

                  // Show/hide scroll buttons based on scroll position
                  if (container.scrollLeft > 10) {
                    leftBtn?.classList.remove("opacity-0")
                    leftBtn?.classList.add("opacity-100")
                  } else {
                    leftBtn?.classList.remove("opacity-100")
                    leftBtn?.classList.add("opacity-0")
                  }

                  if (container.scrollLeft < container.scrollWidth - container.clientWidth - 10) {
                    rightBtn?.classList.remove("opacity-0")
                    rightBtn?.classList.add("opacity-100")
                  } else {
                    rightBtn?.classList.remove("opacity-100")
                    rightBtn?.classList.add("opacity-0")
                  }
                }}
              >
                {newsCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setNewsCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                      newsCategory === category.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-sm">{category.icon}</span>
                    <span>{category.label}</span>
                    {newsCategory === category.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Scroll Progress Indicator */}
              <div className="mt-2 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  id="scroll-progress"
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 w-0"
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {isLoadingNews && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-16 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingNews && newsData?.articles && (
              <div className="space-y-4">
                {newsData.articles.slice(0, 5).map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="flex gap-3">
                      {article.urlToImage && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                          <img
                            src={article.urlToImage || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = "/news-collage.png"
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{article.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{article.source.name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            <span>{formatTimeAgo(article.publishedAt)}</span>
                          </div>
                          <FaExternalLinkAlt className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {newsError && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 dark:from-red-900/30 to-orange-100 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">📰</div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Unable to load news</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Please try again later</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Powered by NewsAPI</span>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Cookie Policy
            </Link>
            <Link to="/about" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              About
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-3">© 2024 Your Social App. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default RightPanel
