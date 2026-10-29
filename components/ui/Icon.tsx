import React from "react";
import { ColorValue, StyleProp, ViewStyle } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  ArrowLeft, Ban, BadgeCheck, Bell, BellDot, Bike, Bookmark, Building2, Calendar, Camera,
  ChevronRight, CircleAlert, CircleCheck, CircleUser, CircleX, Clock, CloudDownload, CloudUpload,
  Download, Droplets, Dumbbell, Euro, File, FileText, Footprints, Hand, Heart, HeartPulse, Hourglass,
  House, Info, Leaf, List, LocateFixed, Lock, LogOut, LucideIcon, Mail, MailOpen, Map, MapPin, Medal,
  MessageSquareMore, Music, Navigation, PawPrint, Pencil, Phone, QrCode, RefreshCw, Search, Send,
  Share2, Shield, SlidersHorizontal, Square, SquareCheck, Trash2, Triangle, Trophy, User, UserPlus,
  Users, Volleyball, Waves, X, Zap,
} from "lucide-react-native";
import { Colors } from "@/constants/theme";

/**
 * Icône commune iziClub : Lucide, trait 2 px.
 * Accepte les anciens noms Ionicons / FontAwesome / MaterialIcons pour faciliter la migration.
 * Seules les marques (réseaux sociaux) restent en FontAwesome, Lucide n'en fournissant pas.
 */
const ICONS: Record<string, LucideIcon> = {
  "alert-circle": CircleAlert, error: CircleAlert,
  "american-football": Trophy, football: Volleyball, basketball: Volleyball, tennisball: Volleyball,
  barbell: Dumbbell, fitness: HeartPulse, "fitness-outline": HeartPulse,
  bicycle: Bike, walk: Footprints, water: Droplets, leaf: Leaf, paw: PawPrint, triangle: Triangle,
  "arrow-back": ArrowLeft,
  bookmark: Bookmark, "bookmark-outline": Bookmark,
  "business-outline": Building2,
  calendar: Calendar, "calendar-outline": Calendar,
  camera: Camera, cancel: Ban,
  "chatbox-ellipses-outline": MessageSquareMore,
  "checkmark-circle": CircleCheck, verified: BadgeCheck,
  "chevron-forward": ChevronRight,
  close: X, "close-circle": CircleX,
  "cloud-download-outline": CloudDownload, "cloud-upload-outline": CloudUpload, "download-outline": Download,
  document: File, "document-text": FileText, "document-text-outline": FileText,
  edit: Pencil,
  envelope: Mail, "mail-open-outline": MailOpen, "mail-unread": Mail,
  eur: Euro,
  flash: Zap,
  "hand-left": Hand,
  heart: Heart, "heart-outline": Heart,
  "home-outline": House,
  "hourglass-outline": Hourglass, "hourglass-top": Hourglass,
  "information-circle-outline": Info,
  list: List,
  "locate-outline": LocateFixed,
  location: MapPin, "location-outline": MapPin, "location-sharp": MapPin, "map-marker": MapPin,
  "lock-closed": Lock,
  "log-out-outline": LogOut,
  map: Map, "map-outline": Map,
  medal: Medal, "medal-outline": Medal,
  "musical-notes": Music,
  navigate: Navigation,
  notifications: BellDot, "notifications-outline": Bell,
  "options-outline": SlidersHorizontal,
  "paper-plane": Send,
  people: Users, "people-outline": Users, "people-circle": Users, "people-circle-outline": Users,
  person: User, "person-outline": User, profile: CircleUser, "person-add-outline": UserPlus,
  phone: Phone,
  "qr-code": QrCode,
  refresh: RefreshCw,
  search: Search, "search-outline": Search,
  "share-social-outline": Share2,
  shield: Shield, "shield-outline": Shield,
  time: Clock, "time-outline": Clock,
  "trash-outline": Trash2,
  "trophy-outline": Trophy,
  checkbox: SquareCheck, "square-outline": Square,
  waves: Waves,
};

/** Variantes « pleines » : uniquement les états aimé / enregistré */
const FILLED = new Set(["heart", "bookmark"]);

/** Marques : pas d'équivalent Lucide, toujours monochromes */
const BRANDS = new Set(["facebook", "instagram", "linkedin", "music"]);

type IconProps = {
  name: string;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export default function Icon({ name, size = 20, color: colorValue = Colors.noir, style }: IconProps) {
  const color = colorValue as string;
  if (BRANDS.has(name)) {
    return <FontAwesome name={name as any} size={size} color={color} style={style as any} />;
  }
  const Glyph = ICONS[name] ?? CircleAlert;
  if (__DEV__ && !ICONS[name]) console.warn(`Icon: "${name}" n'a pas d'équivalent Lucide`);
  return (
    <Glyph
      size={size}
      color={color}
      strokeWidth={2}
      fill={FILLED.has(name) ? color : "none"}
      style={style}
    />
  );
}
