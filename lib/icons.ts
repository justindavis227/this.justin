import {
  LayoutDashboard, CalendarRange, FolderKanban,
  Briefcase, MapPin, GraduationCap, User, Users, Wallet, BookOpen, Heart,
  Tags, Search, Tag, Hammer, FlaskConical, Palette,
  Settings, Box, Star, Flame, Sparkles, ShoppingBag, Car, Receipt,
  TrendingUp, Globe, Coffee, Music, Camera, Bookmark, Zap,
} from 'lucide-react'

export const ICON_MAP = {
  LayoutDashboard, CalendarRange, FolderKanban,
  Briefcase, MapPin, GraduationCap, User, Users, Wallet, BookOpen, Heart,
  Tags, Search, Tag, Hammer, FlaskConical, Palette,
  Settings, Box, Star, Flame, Sparkles, ShoppingBag, Car, Receipt,
  TrendingUp, Globe, Coffee, Music, Camera, Bookmark, Zap,
}

export type IconName = keyof typeof ICON_MAP
export const ICON_NAMES = Object.keys(ICON_MAP) as IconName[]

export function getIcon(name: string | null | undefined) {
  if (name && name in ICON_MAP) return ICON_MAP[name as IconName]
  return Box
}
