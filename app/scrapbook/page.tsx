"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  Download,
  Plus,
  X,
  Heart,
  Star,
  Music,
  Send,
  Lock,
  Edit3,
  Save,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Disc,
  Upload,
  Trash2,
  Feather,
  Sparkles,
  Cloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Types
type NoteType = {
  id: string
  content: string
  color: string
  position: { x: number; y: number }
  rotation: number
  zIndex: number
}

type SelfieType = {
  id: string
  imageData: string
  position: { x: number; y: number }
  rotation: number
  zIndex: number
  scale: number
}

// Update the StickerType to include custom image stickers
type StickerType = {
  id: string
  type: string
  position: { x: number; y: number }
  rotation: number
  zIndex: number
  scale: number
  imageUrl?: string // For custom image stickers
}

// Add a type for doodles
type DoodleType = {
  id: string
  type: string
  position: { x: number; y: number }
  rotation: number
  zIndex: number
  scale: number
  color: string
}

// Update ScrapbookData to include doodles and songDetails
type ScrapbookData = {
  notes: NoteType[]
  selfies: SelfieType[]
  stickers: StickerType[]
  doodles: DoodleType[]
  hiddenMessageUnlocked: boolean
  song?: string
  songDetails?: {
    title: string
    artist: string
  }
}

// Colors for sticky notes
const COLORS = ["bg-yellow-200", "bg-pink-200", "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-orange-200"]

// Update STICKERS array with more options
const STICKERS = [
  { type: "heart", icon: <Heart className="w-full h-full text-red-500" /> },
  { type: "star", icon: <Star className="w-full h-full text-yellow-500" /> },
  { type: "music", icon: <Music className="w-full h-full text-blue-500" /> },
  { type: "sparkle", icon: <Sparkles className="w-full h-full text-purple-500" /> },
  { type: "disc", icon: <Disc className="w-full h-full text-pink-500" /> },
  { type: "cloud", icon: <Cloud className="w-full h-full text-blue-400" /> },
  { type: "feather", icon: <Feather className="w-full h-full text-green-500" /> },
]

// Add DOODLES array
const DOODLES = [
  { type: "squiggle", color: "stroke-pink-500", path: "M10,50 Q30,10 50,50 T90,50" },
  {
    type: "heart",
    color: "stroke-red-500",
    path: "M50,30 Q30,10 10,30 T10,50 Q10,90 50,90 Q90,90 90,50 T90,30 Q70,10 50,30",
  },
  {
    type: "star",
    color: "stroke-yellow-500",
    path: "M50,10 L61,40 H94 L68,60 L79,90 L50,70 L21,90 L32,60 L6,40 H39 Z",
  },
  {
    type: "cloud",
    color: "stroke-blue-400",
    path: "M20,60 Q5,60 5,45 Q5,30 20,30 Q20,15 35,15 Q50,15 50,30 Q65,15 80,30 Q95,30 95,45 Q95,60 80,60 Q80,75 65,75 Q50,75 50,60 Q35,75 20,75 Q5,75 5,60",
  },
  {
    type: "flower",
    color: "stroke-green-500",
    path: "M50,30 A15,15 0 1,1 50,30 M70,50 A15,15 0 1,1 70,50 M50,70 A15,15 0 1,1 50,70 M30,50 A15,15 0 1,1 30,50 M50,50 A5,5 0 1,1 50,50",
  },
  { type: "spiral", color: "stroke-purple-500", path: "M50,50 Q60,40 50,30 Q40,20 30,30 Q20,40 30,50 Q40,60 50,50" },
]

export default function ScrapbookPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State for all scrapbook elements
  const [notes, setNotes] = useState<NoteType[]>([])
  const [selfies, setSelfies] = useState<SelfieType[]>([])
  const [stickers, setStickers] = useState<StickerType[]>([])
  const [doodles, setDoodles] = useState<DoodleType[]>([])
  const [hiddenMessageUnlocked, setHiddenMessageUnlocked] = useState(false)
  const [song, setSong] = useState<string>("")
  const [songDetails, setSongDetails] = useState<{ title: string; artist: string }>({
    title: "Add your favorite song",
    artist: "Artist name",
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [vinylRotation, setVinylRotation] = useState(0)

  // State for active element being dragged
  const [activeElement, setActiveElement] = useState<{ type: string; id: string } | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")

  // Refs
  const boardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("scrapbookData")
    if (savedData) {
      try {
        const data: ScrapbookData = JSON.parse(savedData)
        setNotes(data.notes || [])
        setSelfies(data.selfies || [])
        setStickers(data.stickers || [])
        setDoodles(data.doodles || [])
        setHiddenMessageUnlocked(data.hiddenMessageUnlocked || false)
        setSong(data.song || "")
        if (data.songDetails) {
          setSongDetails(data.songDetails)
        }
      } catch (e) {
        console.error("Error loading saved data", e)
      }
    } else {
      // Add some initial doodles if no saved data
      addInitialDoodles()
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data: ScrapbookData = {
      notes,
      selfies,
      stickers,
      doodles,
      hiddenMessageUnlocked,
      song,
      songDetails,
    }
    localStorage.setItem("scrapbookData", JSON.stringify(data))
  }, [notes, selfies, stickers, doodles, hiddenMessageUnlocked, song, songDetails])

  // Play song if set
  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.src = song
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Error playing audio", e))
      } else {
        audioRef.current.pause()
      }

      // Set muted state
      audioRef.current.muted = isMuted
    }
  }, [song, isPlaying, isMuted])

  // Rotate vinyl when playing
  useEffect(() => {
    let animationFrame: number

    const rotateVinyl = () => {
      if (isPlaying) {
        setVinylRotation((prev) => (prev + 0.5) % 360)
        animationFrame = requestAnimationFrame(rotateVinyl)
      }
    }

    if (isPlaying) {
      animationFrame = requestAnimationFrame(rotateVinyl)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isPlaying])

  // Add some initial doodles
  const addInitialDoodles = () => {
    const initialDoodles: DoodleType[] = Array(5)
      .fill(0)
      .map((_, i) => {
        const randomDoodle = DOODLES[Math.floor(Math.random() * DOODLES.length)]
        return {
          id: `doodle-initial-${i}`,
          type: randomDoodle.type,
          position: {
            x: Math.random() * (boardRef.current?.clientWidth || 800) * 0.8,
            y: Math.random() * (boardRef.current?.clientHeight || 600) * 0.8,
          },
          rotation: Math.random() * 360,
          zIndex: 1,
          scale: 0.5 + Math.random() * 1,
          color: randomDoodle.color,
        }
      })
    setDoodles(initialDoodles)
  }

  // Handle mouse/touch move for dragging elements
  useEffect(() => {
    if (!activeElement) return

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!boardRef.current || !activeElement) return

      const boardRect = boardRef.current.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      const x = clientX - boardRect.left
      const y = clientY - boardRect.top

      if (activeElement.type === "note") {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === activeElement.id
              ? { ...note, position: { x, y }, zIndex: Math.max(...prev.map((n) => n.zIndex), 0) + 1 }
              : note,
          ),
        )
      } else if (activeElement.type === "selfie") {
        setSelfies((prev) =>
          prev.map((selfie) =>
            selfie.id === activeElement.id
              ? { ...selfie, position: { x, y }, zIndex: Math.max(...prev.map((s) => s.zIndex), 0) + 1 }
              : selfie,
          ),
        )
      } else if (activeElement.type === "sticker") {
        setStickers((prev) =>
          prev.map((sticker) =>
            sticker.id === activeElement.id
              ? { ...sticker, position: { x, y }, zIndex: Math.max(...prev.map((s) => s.zIndex), 0) + 1 }
              : sticker,
          ),
        )
      } else if (activeElement.type === "doodle") {
        setDoodles((prev) =>
          prev.map((doodle) =>
            doodle.id === activeElement.id
              ? { ...doodle, position: { x, y }, zIndex: Math.max(...prev.map((d) => d.zIndex), 0) + 1 }
              : doodle,
          ),
        )
      }
    }

    const handleMouseUp = () => {
      setActiveElement(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchend", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [activeElement])

  // Add a new note
  const addNote = (color = COLORS[0]) => {
    const newNote: NoteType = {
      id: `note-${Date.now()}`,
      content: "Click to edit...",
      color,
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      rotation: Math.random() * 10 - 5,
      zIndex: Math.max(...notes.map((n) => n.zIndex), 0) + 1,
    }
    setNotes([...notes, newNote])
    setEditingNote(newNote.id)
    setNoteContent("Click to edit...")
  }

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (editingNote === id) {
      setEditingNote(null)
    }
  }

  // Start camera for selfie
  const startCamera = async () => {
    try {
      if (!videoRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      videoRef.current.play()
    } catch (err) {
      console.error("Error accessing camera:", err)
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  // Take a selfie
  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = canvas.toDataURL("image/png")

    // Add selfie to state
    const newSelfie: SelfieType = {
      id: `selfie-${Date.now()}`,
      imageData,
      position: { x: 150 + Math.random() * 100, y: 150 + Math.random() * 100 },
      rotation: Math.random() * 10 - 5,
      zIndex: Math.max(...selfies.map((s) => s.zIndex), 0) + 1,
      scale: 1,
    }

    setSelfies([...selfies, newSelfie])

    // Stop camera
    stopCamera()
  }

  // Stop camera
  const stopCamera = () => {
    if (!videoRef.current) return

    const stream = videoRef.current.srcObject as MediaStream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Add a sticker
  const addSticker = (type: string) => {
    const newSticker: StickerType = {
      id: `sticker-${Date.now()}`,
      type,
      position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 },
      rotation: Math.random() * 20 - 10,
      zIndex: Math.max(...stickers.map((s) => s.zIndex), 0) + 1,
      scale: 1,
    }
    setStickers([...stickers, newSticker])
  }

  // Add a doodle
  const addDoodle = (type: string, color: string) => {
    const newDoodle: DoodleType = {
      id: `doodle-${Date.now()}`,
      type,
      position: { x: 300 + Math.random() * 100, y: 300 + Math.random() * 100 },
      rotation: Math.random() * 360,
      zIndex: Math.max(...doodles.map((d) => d.zIndex), 0) + 1,
      scale: 1,
      color,
    }
    setDoodles([...doodles, newDoodle])
  }

  // Add a custom image sticker
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      if (imageUrl) {
        const newSticker: StickerType = {
          id: `sticker-custom-${Date.now()}`,
          type: "custom",
          position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 },
          rotation: Math.random() * 20 - 10,
          zIndex: Math.max(...stickers.map((s) => s.zIndex), 0) + 1,
          scale: 1,
          imageUrl,
        }
        setStickers([...stickers, newSticker])

        toast({
          title: "Image Added",
          description: "Your custom image has been added to the scrapbook!",
        })
      }
    }
    reader.readAsDataURL(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Delete a sticker
  const deleteSticker = (id: string) => {
    setStickers(stickers.filter((sticker) => sticker.id !== id))
  }

  // Delete a doodle
  const deleteDoodle = (id: string) => {
    setDoodles(doodles.filter((doodle) => doodle.id !== id))
  }

  // Delete a selfie
  const deleteSelfie = (id: string) => {
    setSelfies(selfies.filter((selfie) => selfie.id !== id))
  }

  // Rotate an element
  const rotateElement = (type: string, id: string, delta: number) => {
    if (type === "note") {
      setNotes(notes.map((note) => (note.id === id ? { ...note, rotation: note.rotation + delta } : note)))
    } else if (type === "selfie") {
      setSelfies(
        selfies.map((selfie) => (selfie.id === id ? { ...selfie, rotation: selfie.rotation + delta } : selfie)),
      )
    } else if (type === "sticker") {
      setStickers(
        stickers.map((sticker) => (sticker.id === id ? { ...sticker, rotation: sticker.rotation + delta } : sticker)),
      )
    } else if (type === "doodle") {
      setDoodles(
        doodles.map((doodle) => (doodle.id === id ? { ...doodle, rotation: doodle.rotation + delta } : doodle)),
      )
    }
  }

  // Scale an element
  const scaleElement = (type: string, id: string, scale: number) => {
    if (type === "selfie") {
      setSelfies(selfies.map((selfie) => (selfie.id === id ? { ...selfie, scale } : selfie)))
    } else if (type === "sticker") {
      setStickers(stickers.map((sticker) => (sticker.id === id ? { ...sticker, scale } : sticker)))
    } else if (type === "doodle") {
      setDoodles(doodles.map((doodle) => (doodle.id === id ? { ...doodle, scale } : doodle)))
    }
  }

  // Set song URL and details
  const setSongUrl = (url: string, title: string, artist: string) => {
    setSong(url)
    setSongDetails({ title, artist })
    toast({
      title: "Song Added",
      description: "Your song has been added to the scrapbook!",
    })
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((e) => console.error("Error playing audio", e))
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Clear all elements
  const clearAll = () => {
    if (confirm("Are you sure you want to clear everything? This cannot be undone.")) {
      setNotes([])
      setSelfies([])
      setStickers([])
      setDoodles([])
      toast({
        title: "Scrapbook Cleared",
        description: "Your scrapbook has been cleared.",
      })
    }
  }

  // Render a doodle based on its type
  const renderDoodle = (doodle: DoodleType) => {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${doodle.color} fill-none stroke-[5]`}>
        {doodle.type === "squiggle" && <path d="M10,50 Q30,10 50,50 T90,50" className="animate-draw" />}
        {doodle.type === "heart" && (
          <path d="M50,30 Q30,10 10,30 T10,50 Q10,90 50,90 Q90,90 90,50 T90,30 Q70,10 50,30" className="animate-draw" />
        )}
        {doodle.type === "star" && (
          <path d="M50,10 L61,40 H94 L68,60 L79,90 L50,70 L21,90 L32,60 L6,40 H39 Z" className="animate-draw" />
        )}
        {doodle.type === "cloud" && (
          <path
            d="M20,60 Q5,60 5,45 Q5,30 20,30 Q20,15 35,15 Q50,15 50,30 Q65,15 80,30 Q95,30 95,45 Q95,60 80,60 Q80,75 65,75 Q50,75 50,60 Q35,75 20,75 Q5,75 5,60"
            className="animate-draw"
          />
        )}
        {doodle.type === "flower" && (
          <>
            <circle cx="50" cy="30" r="15" className="animate-draw" />
            <circle cx="70" cy="50" r="15" className="animate-draw" />
            <circle cx="50" cy="70" r="15" className="animate-draw" />
            <circle cx="30" cy="50" r="15" className="animate-draw" />
            <circle cx="50" cy="50" r="5" className="animate-draw" />
          </>
        )}
        {doodle.type === "spiral" && (
          <path d="M50,50 Q60,40 50,30 Q40,20 30,30 Q20,40 30,50 Q40,60 50,50" className="animate-draw" />
        )}
      </svg>
    )
  }

  // Download scrapbook as image
  const downloadScrapbook = () => {
    if (!boardRef.current) return

    // This would be implemented with html2canvas or similar
    toast({
      title: "Download Feature",
      description: "This feature would capture the current state of your scrapbook as an image.",
    })
  }

  // Share scrapbook
  const shareScrapbook = () => {
    toast({
      title: "Share Feature",
      description: "This feature would allow you to share your scrapbook with others.",
    })
  }

  return (
    <div className="min-h-screen bg-amber-50 font-geist-mono">
      {/* Header */}
      <header className="p-4 bg-amber-100 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-garamond font-bold">Our Little Scrapbook</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="flex items-center gap-1">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Welcome</span>
          </Button>
          <Button variant="outline" size="sm" onClick={downloadScrapbook} className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button variant="outline" size="sm" onClick={shareScrapbook} className="flex items-center gap-1">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      {/* Main scrapbook board */}
      <div
        ref={boardRef}
        className="relative min-h-[calc(100vh-64px)] bg-amber-50 p-4 overflow-hidden"
        style={{
          backgroundImage: "url('/cork-board.png')",
          backgroundSize: "cover",
        }}
      >
        {/* Background doodles */}
        <AnimatePresence>
          {doodles.map((doodle) => (
            <motion.div
              key={doodle.id}
              className="absolute cursor-move"
              style={{
                left: `${doodle.position.x}px`,
                top: `${doodle.position.y}px`,
                zIndex: doodle.zIndex,
                width: "80px",
                height: "80px",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: doodle.scale,
                rotate: doodle.rotation,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: doodle.scale * 1.05 }}
              onMouseDown={() => setActiveElement({ type: "doodle", id: doodle.id })}
              onTouchStart={() => setActiveElement({ type: "doodle", id: doodle.id })}
            >
              <div className="relative group">
                {renderDoodle(doodle)}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 bg-white/80 rounded-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDoodle(doodle.id)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Notes */}
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              className={`absolute p-4 w-48 h-48 shadow-md ${note.color} cursor-move`}
              style={{
                left: `${note.position.x}px`,
                top: `${note.position.y}px`,
                zIndex: note.zIndex,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: note.rotation,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              onMouseDown={() => editingNote !== note.id && setActiveElement({ type: "note", id: note.id })}
              onTouchStart={() => editingNote !== note.id && setActiveElement({ type: "note", id: note.id })}
            >
              {editingNote === note.id ? (
                <div className="h-full flex flex-col">
                  <textarea
                    className="flex-1 bg-transparent resize-none outline-none font-geist-mono text-sm"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingNote(null)
                        setNotes(notes.map((n) => (n.id === note.id ? { ...n, content: noteContent } : n)))
                      }}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          rotateElement("note", note.id, -5)
                        }}
                      >
                        ↺
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          rotateElement("note", note.id, 5)
                        }}
                      >
                        ↻
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-full overflow-auto font-geist-mono text-sm whitespace-pre-wrap">{note.content}</div>
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingNote(note.id)
                        setNoteContent(note.content)
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Selfies */}
        <AnimatePresence>
          {selfies.map((selfie) => (
            <motion.div
              key={selfie.id}
              className="absolute cursor-move"
              style={{
                left: `${selfie.position.x}px`,
                top: `${selfie.position.y}px`,
                zIndex: selfie.zIndex,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: selfie.scale,
                rotate: selfie.rotation,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{
                scale: selfie.scale * 1.03,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              onMouseDown={() => setActiveElement({ type: "selfie", id: selfie.id })}
              onTouchStart={() => setActiveElement({ type: "selfie", id: selfie.id })}
            >
              <div className="relative bg-white p-3 shadow-md border-2 border-gray-200 group">
                <img src={selfie.imageData || "/placeholder.svg"} alt="Selfie" className="w-48 h-auto" />
                <div className="absolute top-1 right-1 flex gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity bg-white/80"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Rotation</h4>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => rotateElement("selfie", selfie.id, -5)}>
                              ↺
                            </Button>
                            <Slider
                              defaultValue={[selfie.rotation]}
                              min={-45}
                              max={45}
                              step={1}
                              onValueChange={(value) => {
                                setSelfies(selfies.map((s) => (s.id === selfie.id ? { ...s, rotation: value[0] } : s)))
                              }}
                            />
                            <Button variant="outline" size="sm" onClick={() => rotateElement("selfie", selfie.id, 5)}>
                              ↻
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Size</h4>
                          <Slider
                            defaultValue={[selfie.scale]}
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            onValueChange={(value) => {
                              scaleElement("selfie", selfie.id, value[0])
                            }}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity bg-white/80"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSelfie(selfie.id)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Stickers */}
        <AnimatePresence>
          {stickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              className="absolute cursor-move"
              style={{
                left: `${sticker.position.x}px`,
                top: `${sticker.position.y}px`,
                zIndex: sticker.zIndex,
                width: sticker.type === "custom" ? "auto" : "40px",
                height: sticker.type === "custom" ? "auto" : "40px",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: sticker.scale,
                rotate: sticker.rotation,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.3,
                ...(sticker.type !== "custom" && {
                  y: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  },
                }),
              }}
              whileHover={{ scale: sticker.scale * 1.1 }}
              drag
              dragMomentum={false}
              onDragStart={() => setActiveElement({ type: "sticker", id: sticker.id })}
            >
              <div className="relative group">
                {sticker.type === "custom" ? (
                  <img
                    src={sticker.imageUrl || "/placeholder.svg"}
                    alt="Custom sticker"
                    className="max-w-[100px] max-h-[100px] object-contain"
                  />
                ) : (
                  STICKERS.find((s) => s.type === sticker.type)?.icon
                )}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-6 w-6 p-0 bg-white rounded-full">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Rotation</h4>
                          <Slider
                            defaultValue={[sticker.rotation]}
                            min={-180}
                            max={180}
                            step={5}
                            onValueChange={(value) => {
                              setStickers(stickers.map((s) => (s.id === sticker.id ? { ...s, rotation: value[0] } : s)))
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Size</h4>
                          <Slider
                            defaultValue={[sticker.scale]}
                            min={0.5}
                            max={2}
                            step={0.1}
                            onValueChange={(value) => {
                              scaleElement("sticker", sticker.id, value[0])
                            }}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 p-0 bg-white rounded-full mt-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSticker(sticker.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hidden message */}
        <motion.div
          className="absolute left-8 bottom-8 cursor-pointer"
          style={{ zIndex: 1000 }}
          onClick={() => setHiddenMessageUnlocked(!hiddenMessageUnlocked)}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="bg-pink-100 p-4 shadow-md rounded-md w-48 flex items-center gap-2">
            {hiddenMessageUnlocked ? (
              <>
                <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                <p className="text-sm">Thank you for sharing a piece of yourself with me! You're amazing! ❤️</p>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-pink-500" />
                <p className="text-sm">Click to reveal a secret message</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Vinyl Music Player */}
        <motion.div
          className="absolute right-8 bottom-8 w-64 bg-gray-900 rounded-lg shadow-xl p-4 text-white"
          style={{ zIndex: 1000 }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-garamond font-bold text-sm">Vinyl Player</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white">
                  <Edit3 className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Add Your Favorite Song</h4>
                  <div className="space-y-2">
                    <Label htmlFor="song-url">Song URL (YouTube, Spotify, etc.)</Label>
                    <Input
                      id="song-url"
                      placeholder="https://..."
                      value={song}
                      onChange={(e) => setSong(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="song-title">Song Title</Label>
                    <Input
                      id="song-title"
                      placeholder="Song title"
                      value={songDetails.title}
                      onChange={(e) => setSongDetails({ ...songDetails, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="song-artist">Artist</Label>
                    <Input
                      id="song-artist"
                      placeholder="Artist name"
                      value={songDetails.artist}
                      onChange={(e) => setSongDetails({ ...songDetails, artist: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => setSongUrl(song, songDetails.title, songDetails.artist)} className="w-full">
                    <Music className="w-4 h-4 mr-2" />
                    Set Song
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-4">
            {/* Vinyl record */}
            <motion.div
              className="w-20 h-20 rounded-full bg-black border-4 border-gray-800 relative overflow-hidden"
              animate={{ rotate: vinylRotation }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-900 opacity-50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-gray-700 opacity-50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-gray-700 opacity-30"></div>
              </div>
            </motion.div>

            {/* Song info and controls */}
            <div className="flex-1">
              <div className="text-xs font-bold truncate">{songDetails.title}</div>
              <div className="text-xs text-gray-400 truncate">{songDetails.artist}</div>

              <div className="flex items-center justify-between mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-gray-800 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-gray-800 rounded-full"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating action buttons */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg bg-pink-500 hover:bg-pink-600">
              <Plus className="w-6 h-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Tabs defaultValue="notes">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="selfie">Selfie</TabsTrigger>
                <TabsTrigger value="stickers">Stickers</TabsTrigger>
                <TabsTrigger value="doodles">Doodles</TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="space-y-4 mt-2">
                <h3 className="font-medium">Add a new note</h3>
                <div className="grid grid-cols-3 gap-2">
                  {COLORS.map((color) => (
                    <Button key={color} className={`h-16 ${color}`} variant="outline" onClick={() => addNote(color)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="selfie" className="space-y-4 mt-2">
                <h3 className="font-medium">Take a selfie</h3>
                <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-center gap-2">
                  <Button onClick={startCamera} className="flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </Button>
                  <Button onClick={takeSelfie} className="flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    Take Selfie
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="stickers" className="space-y-4 mt-2">
                <h3 className="font-medium">Choose a sticker or upload your own</h3>
                <div className="grid grid-cols-4 gap-2">
                  {STICKERS.map((sticker) => (
                    <Button
                      key={sticker.type}
                      variant="outline"
                      className="h-14 flex items-center justify-center"
                      onClick={() => addSticker(sticker.type)}
                    >
                      <div className="w-8 h-8">{sticker.icon}</div>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="h-14 flex flex-col items-center justify-center"
                    onClick={triggerFileInput}
                  >
                    <Upload className="w-6 h-6 mb-1 text-gray-500" />
                    <span className="text-xs">Upload</span>
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </TabsContent>

              <TabsContent value="doodles" className="space-y-4 mt-2">
                <h3 className="font-medium">Add a doodle</h3>
                <div className="grid grid-cols-3 gap-2">
                  {DOODLES.map((doodle) => (
                    <Button
                      key={doodle.type}
                      variant="outline"
                      className="h-16 flex items-center justify-center p-2"
                      onClick={() => addDoodle(doodle.type, doodle.color)}
                    >
                      <div className="w-10 h-10">
                        <svg viewBox="0 0 100 100" className={`w-full h-full ${doodle.color} fill-none stroke-[5]`}>
                          <path d={doodle.path || ""} />
                        </svg>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 border-red-200 text-red-500 hover:bg-red-50"
          onClick={clearAll}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Audio player (hidden) */}
      <audio ref={audioRef} loop className="hidden" />
    </div>
  )
}

