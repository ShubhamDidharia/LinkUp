"use client"

import { CiImageOn } from "react-icons/ci"
import { BsEmojiSmileFill } from "react-icons/bs"
import { useRef, useState } from "react"
import { IoCloseSharp } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

const CreatePost = () => {
  const [text, setText] = useState("")
  const [img, setImg] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
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
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed to create post")
        }
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      toast.success("Post created successfully")
      // invalidate queries to fetch updated posts after creating
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  const data = {
    profileImg: authUser?.profileImage,
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createPost({ text, img })
    setText("")
    setImg(null)
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

  return (
    <div className="bg-white border-b border-slate-100 p-6">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md">
            <img
              src={data.profileImg || "/avatar-placeholder.png"}
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Post Form */}
        <form className="flex-1" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Text Input with Dark Background */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
              <textarea
                ref={textareaRef}
                className="w-full text-xl text-slate-800 placeholder-slate-500 resize-none border-none focus:outline-none bg-transparent"
                placeholder="What's happening?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
            </div>

            {/* Image Preview */}
            {img && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-md">
                <button
                  type="button"
                  className="absolute top-3 right-3 p-2 bg-black/70 rounded-full text-white hover:bg-black/80 transition-colors z-10"
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
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4 relative">
                <button
                  type="button"
                  className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                  onClick={() => imgRef.current.click()}
                >
                  <CiImageOn className="w-6 h-6" />
                </button>

                {/* Emoji Button with Picker */}
                <div className="relative">
                  <button
                    type="button"
                    className={`p-2 rounded-full transition-colors ${
                      showEmojiPicker ? "text-blue-600 bg-blue-50" : "text-blue-500 hover:bg-blue-50"
                    }`}
                    onClick={toggleEmojiPicker}
                  >
                    <BsEmojiSmileFill className="w-5 h-5" />
                  </button>

                  {/* Emoji Picker Dropdown */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-80 max-h-64 overflow-y-auto z-20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-700">Choose an emoji</h3>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <IoCloseSharp className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            className="p-2 text-xl hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error.message}</p>
              </div>
            )}
          </div>

          <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
        </form>
      </div>

      {/* Overlay to close emoji picker when clicking outside */}
      {showEmojiPicker && <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />}
    </div>
  )
}

export default CreatePost
