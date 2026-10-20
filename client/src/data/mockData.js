import {
  Home, Zap, PlaySquare, History, Video, Clock, ThumbsUp, PlusCircle, Link2,
  Flame, Music, Gamepad2, Clapperboard, Radio, Trophy, Settings, HelpCircle,
  MessageSquare,
} from "lucide-react";

export const sidebarSections = [
  {
    id: "main",
    title: null,
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "shorts", label: "Shorts", icon: Zap },
      { id: "subscriptions", label: "Subscriptions", icon: PlaySquare },
    ],
  },
  {
    id: "you",
    title: "You",
    items: [
      { id: "history", label: "History", icon: History },
      { id: "your-videos", label: "Your Videos", icon: Video },
      { id: "watch-later", label: "Watch Later", icon: Clock },
      { id: "liked", label: "Liked Videos", icon: ThumbsUp },
    ],
  },
  {
    id: "party",
    title: "Watch Party",
    items: [
      { id: "create-room", label: "Create Room", icon: PlusCircle, action: "create" },
      { id: "join-room", label: "Join Room", icon: Link2, action: "join" },
    ],
  },
  {
    id: "explore",
    title: "Explore",
    items: [
      { id: "trending", label: "Trending", icon: Flame },
      { id: "music", label: "Music", icon: Music },
      { id: "gaming", label: "Gaming", icon: Gamepad2 },
      { id: "movies", label: "Movies", icon: Clapperboard },
      { id: "live", label: "Live", icon: Radio },
      { id: "sports", label: "Sports", icon: Trophy },
    ],
  },
  {
    id: "more",
    title: "More",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
      { id: "help", label: "Help", icon: HelpCircle },
      { id: "feedback", label: "Send Feedback", icon: MessageSquare },
    ],
  },
];

export const categories = [
  "All", "Gaming", "Music", "Live", "Mixes", "Action-adventure games", "Recently uploaded",
];

export const shorts = [
  { id: 1, title: "Cool Cat 😎", views: "12M views", bg: "linear-gradient(160deg,#f59e0b,#7c2d12)" },
  { id: 2, title: "King Kohli 👑", views: "8.9M views", bg: "linear-gradient(160deg,#2563eb,#0f172a)" },
  { id: 3, title: "Dog Vibes 😄", views: "15M views", bg: "linear-gradient(160deg,#eab308,#713f12)" },
  { id: 4, title: "Gojo 🔥", views: "11M views", bg: "linear-gradient(160deg,#6366f1,#111827)" },
  { id: 5, title: "Pretty Girl ❤️", views: "14M views", bg: "linear-gradient(160deg,#ec4899,#4c1d95)" },
];

export const videos = [
  {
    id: 1, title: "AP Dhillon - With You (Official Video)", channel: "AP Dhillon",
    views: "78M views", age: "1 year ago", duration: "3:48", likes: "3.2M",
    bg: "linear-gradient(135deg,#1e3a8a,#0f172a)",
  },
  {
    id: 2, title: "Exploring Switzerland 4K - The Most Beautiful Country", channel: "Drone Snap",
    views: "12M views", age: "2 years ago", duration: "15:20", likes: "632K",
    bg: "linear-gradient(135deg,#0d9488,#1e3a8a)",
  },
  {
    id: 3, title: "India vs Australia 4th Test Full Highlights", channel: "Cricket Highlights",
    views: "5.6M views", age: "1 day ago", duration: "12:23", likes: "241K",
    bg: "linear-gradient(135deg,#1d4ed8,#78350f)",
  },
];

export const activeRooms = [
  { roomId: "ABC123", watching: 4, bg: "linear-gradient(135deg,#f97316,#1e3a8a)" },
];

export const trending = [
  { id: 1, title: "Pushpa 2 Trailer", channel: "T-Series", views: "28M views", bg: "linear-gradient(135deg,#b45309,#450a0a)" },
  { id: 2, title: "IPL 2026 Auction", channel: "JioHotstar", views: "12M views", bg: "linear-gradient(135deg,#2563eb,#172554)" },
  { id: 3, title: "Dune: Part Two", channel: "Warner Bros. India", views: "24M views", bg: "linear-gradient(135deg,#d97706,#431407)" },
  { id: 4, title: "KGF Chapter 3", channel: "Hombale Films", views: "22M views", bg: "linear-gradient(135deg,#78350f,#1c1917)" },
  { id: 5, title: "The Boys S5", channel: "Prime Video India", views: "9.8M views", bg: "linear-gradient(135deg,#7f1d1d,#0f172a)" },
];