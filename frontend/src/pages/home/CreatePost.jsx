"use client"

import { CiImageOn } from "react-icons/ci"
import { BsEmojiSmileFill } from "react-icons/bs"
import { MdOutlineAutoAwesome } from "react-icons/md"
import { useRef, useState } from "react"
import { IoCloseSharp } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const CreatePost = () => {
  const [text, setText] = useState("")
  const [img, setImg] = useState(null)
  const [isNSFW, setIsNSFW] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [aiDescription, setAiDescription] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const imgRef = useRef(null)
  const textareaRef = useRef(null)
  const { data: authUser } = useQuery({ queryKey: ["authUser"] })
  const queryClient = useQueryClient()

  // Common emojis for the picker
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👿",
    "👹",
    "👺",
    "🤡",
    "💩",
    "👻",
    "💀",
    "☠️",
    "👽",
    "👾",
    "🤖",
    "🎃",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "👍",
    "👎",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤝",
    "🙏",
    "✍️",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🔥",
    "⭐",
    "🌟",
    "✨",
    "⚡",
    "💥",
    "💯",
    "💢",
    "💨",
    "💫",
  ]

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img, isNSFW }) => {
      try {
        let imageUrl = null;
        if (img) {
          const uploadRes = await fetch("/api/posts/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ img }),
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload image");
          imageUrl = uploadData.imageUrl;
        }

        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, imageUrl, isNSFW }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to create post")
        }
        return data
      } catch (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (data) => {
      if (data.autoFlagged) {
        toast.error("Your post was automatically flagged as NSFW and blurred.");
      } else {
        toast.success("Post created successfully");
      }

      if (data.userStatus === 'under_review') {
        toast.warning("Your account is under review due to multiple violations.");
      } else if (data.userStatus === 'suspended') {
        toast.error("Your account has been suspended.");
      }

      // invalidate queries to fetch updated posts after creating
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
      setText("")
      setImg(null)
      setIsNSFW(false)
    },
  })

  const data = {
    profileImg: authUser?.profileImage,
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createPost({ text, img, isNSFW })
  }

  const handleImgChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImg(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEmojiClick = (emoji) => {
    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const textBefore = text.substring(0, cursorPosition)
    const textAfter = text.substring(cursorPosition)
    const newText = textBefore + emoji + textAfter

    setText(newText)
    setShowEmojiPicker(false)

    // Set cursor position after the emoji
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length)
    }, 0)
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const generatePostContent = async () => {
    if (!aiDescription.trim()) {
      toast.error("Please describe what you want to post")
      return
    }

    setAiLoading(true)
    let retries = 0
    const maxRetries = 3

    const attemptGenerate = async () => {
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ description: aiDescription }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to generate post content")
        }

        setGeneratedContent(data.content)
      } catch (error) {
        retries++
        if (retries < maxRetries) {
          console.log(`Attempt ${retries} failed. Retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
          await attemptGenerate()
        } else {
          toast.error(error.message)
          console.error("Error generating post content after retries:", error)
          setAiLoading(false)
        }
      }
    }

    await attemptGenerate()
    setAiLoading(false)
  }

  const handleUseGeneratedContent = () => {
    setText(generatedContent)
    setShowAIGenerator(false)
    setAiDescription("")
    setGeneratedContent("")
    toast.success("Content added to post!")
  }

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-6 transition-colors">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-md">
            <img
              src={data.profileImg || "/avatar-placeholder.png"}
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Post Form */}
        <form className="flex-1" onSubmit={handleSubmit}>
          {authUser?.status === 'suspended' ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <h3 className="text-red-600 dark:text-red-400 font-bold text-lg mb-2">Account Suspended</h3>
              <p className="text-red-500 dark:text-red-300">You cannot create new posts because your account has been suspended due to repeated violations.</p>
            </div>
          ) : (
          <div className="space-y-4">
            {authUser?.status === 'under_review' && (
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-amber-800 dark:text-amber-300 text-sm font-semibold">
                ⚠️ Your account is under review due to multiple violations.
              </div>
            )}
            {/* Text Input with Dark Background */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600 focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
              <textarea
                ref={textareaRef}
                className="w-full text-xl text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none border-none focus:outline-none bg-transparent"
                placeholder="What's happening?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
            </div>

            {/* Image Preview */}
            {img && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-md">
                <button
                  type="button"
                  className="absolute top-3 right-3 p-2 bg-black/70 dark:bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors z-10"
                  onClick={() => {
                    setImg(null)
                    imgRef.current.value = null
                  }}
                >
                  <IoCloseSharp className="w-4 h-4" />
                </button>
                <img src={img || "/placeholder.svg"} className="w-full h-auto object-cover" alt="Post preview" />
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 relative">
                <button
                  type="button"
                  className="p-2 rounded-full text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => imgRef.current.click()}
                >
                  <CiImageOn className="w-6 h-6" />
                </button>

                {/* AI Post Generator Button */}
                <button
                  type="button"
                  className="p-2 rounded-full text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
                  onClick={() => setShowAIGenerator(true)}
                  title="Generate post with AI"
                >
                  <MdOutlineAutoAwesome className="w-6 h-6" />
                </button>

                {/* Emoji Button with Picker */}
                <div className="relative">
                  <button
                    type="button"
                    className={`p-2 rounded-full transition-colors ${
                      showEmojiPicker 
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" 
                        : "text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    }`}
                    onClick={toggleEmojiPicker}
                  >
                    <BsEmojiSmileFill className="w-5 h-5" />
                  </button>

                  {/* Emoji Picker Dropdown */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 w-80 max-h-64 overflow-y-auto z-20 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Choose an emoji</h3>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <IoCloseSharp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            className="p-2 text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* NSFW Checkbox */}
                <label className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={isNSFW}
                    onChange={(e) => setIsNSFW(e.target.checked)}
                    className="w-4 h-4 text-red-500 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-red-500 dark:text-red-400">Mark as Sensitive (NSFW)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending || (!text.trim() && !img)}
                className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Posting..." : "Post"}
              </button>
            </div>

            {/* Error Message */}
            {isError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                <p className="text-red-600 dark:text-red-400 text-sm">{error.message}</p>
              </div>
            )}
          </div>
          )}

          <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
        </form>
      </div>

      {/* Overlay to close emoji picker when clicking outside */}
      {showEmojiPicker && <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />}

      {/* AI Post Generator Modal */}
      {showAIGenerator && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => !aiLoading && setShowAIGenerator(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 z-40 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MdOutlineAutoAwesome className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-slate-900">Generate Post with AI</h2>
              </div>
              <button
                onClick={() => !aiLoading && setShowAIGenerator(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                disabled={aiLoading}
              >
                <IoCloseSharp className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!generatedContent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What do you want to post about?
                    </label>
                    <textarea
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-slate-900"
                      placeholder="E.g., 'I just finished a marathon', 'Celebrating my promotion', 'Check out my new coffee shop'..."
                      rows={4}
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      disabled={aiLoading}
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    💡 Tip: Be vague and descriptive. The AI will generate authentic, engaging post content for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Generated Post:</p>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{generatedContent}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-end gap-3">
              {generatedContent ? (
                <>
                  <button
                    onClick={() => {
                      setGeneratedContent("")
                      setAiDescription("")
                    }}
                    disabled={aiLoading}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-full font-semibold transition-colors disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleUseGeneratedContent}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-full font-semibold transition-colors disabled:opacity-50"
                  >
                    Use This
                  </button>
                </>
              ) : (
                <button
                  onClick={generatePostContent}
                  disabled={!aiDescription.trim() || aiLoading}
                  className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-full font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <MdOutlineAutoAwesome className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CreatePost
