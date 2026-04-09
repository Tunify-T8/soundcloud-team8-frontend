import { useState, useRef, useEffect } from "react";
import {
  Lock, MoreVertical, Heart, MessageSquare, Repeat2,
  Download, Pencil, ListPlus, CircleDollarSign, SlidersHorizontal, Share2, TrendingUp, Link, Trash2, X
} from "lucide-react";
import type { Track } from "@/shared/types/Track";
import { trackService } from "../trackService";
import { usePlayer } from "@/features/playerUI/context/usePlayer";
import amplify from "@/assets/amplify.png";
import silhouette from "@/assets/silhouette.png";


function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(seconds: number | string | null | undefined): string {
  if (!seconds) return "0:00";
  const s = typeof seconds === "string" ? parseInt(seconds, 10) : seconds;
  if (isNaN(s)) return String(seconds); // already formatted like "3:34"
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function DeleteConfirmModal({
  track,
  onCancel,
  onDeleted,
}: {
  track: Track;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await trackService.deleteTrack(track.id);
      onDeleted(track.id);
    } catch (e) {
      console.error("Failed to delete track:", e);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-[#111] border border-zinc-800 rounded-xl w-[540px] p-8 pointer-events-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">Permanently delete this track?</h2>
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 flex-shrink-0 bg-zinc-700 rounded flex items-center justify-center overflow-hidden">
              {track.thumbnailUrl ? (
                <img src={track.thumbnailUrl} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                  <polygon points="2,0 14,7 2,14" />
                </svg>
              )}
              {track.isPrivate && (
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
                  <Lock className="w-3 h-3 text-zinc-400" />
                </div>
              )}
            </div>
            <span className="text-white font-semibold text-base">{track.title}</span>
          </div>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Removing this track is irreversible. You will lose all the plays, likes, and comments for this track with no way to get them back.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {loading ? "Deleting..." : "Delete forever"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ArtistProPurchaseModal({ onClose }: { onClose: () => void }) {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [payment, setPayment] = useState<"card" | "paypal">("card");
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");

  const total = billing === "yearly" ? "EGP 899.88" : "EGP 149.99";
  const cycle = billing === "yearly" ? "Yearly" : "Monthly";

  return (
    <>
     <div className="fixed inset-0 z-50" style={{ background: "rgba(246, 235, 235, 0.83)" }} onClick={onClose} />
      <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl w-[860px] max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-10 grid grid-cols-2 gap-12">
            {/* Left column */}
            <div>
              <h2 className="text-gray-900 text-2xl font-bold mb-8">Get Artist Pro</h2>

              {/* Step 1 */}
              <h3 className="text-gray-900 text-base font-semibold mb-4">1. Billing cycle</h3>

              {/* Yearly */}
              <label
                className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 cursor-pointer mb-3 transition-colors
                  ${billing === "yearly" ? "border-orange-500 bg-white" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="billing"
                  value="yearly"
                  checked={billing === "yearly"}
                  onChange={() => setBilling("yearly")}
                  className="accent-orange-500 w-4 h-4 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-semibold">Yearly billing</p>
                  <p className="text-gray-500 text-xs mt-0.5">EGP 899.88, that's EGP 74.99/month</p>
                </div>
                <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded flex-shrink-0">
                  50% YEARLY DISCOUNT
                </span>
              </label>

              {/* Monthly */}
              <label
                className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 cursor-pointer mb-8 transition-colors
                  ${billing === "monthly" ? "border-orange-500 bg-white" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="billing"
                  value="monthly"
                  checked={billing === "monthly"}
                  onChange={() => setBilling("monthly")}
                  className="accent-orange-500 w-4 h-4 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-semibold">Monthly billing</p>
                  <p className="text-gray-500 text-xs mt-0.5">EGP 149.99/month</p>
                </div>
              </label>

              {/* Step 2 */}
              <h3 className="text-gray-900 text-base font-semibold mb-1 flex items-center gap-2">
                2. Payment details
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </h3>
              <p className="text-gray-500 text-xs mb-4">Add new payment methods</p>

              {/* Card */}
              <label
                className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 cursor-pointer mb-3 transition-colors
                  ${payment === "card" ? "border-orange-500" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={payment === "card"}
                  onChange={() => setPayment("card")}
                  className="accent-orange-500 w-4 h-4 flex-shrink-0"
                />
                <span className="text-gray-900 text-sm font-semibold flex-1">Card</span>
                <div className="flex items-center gap-1">
                  {/* Card brand icons as colored pills */}
                  {[
                    { label: "VISA", bg: "#1a1f71", color: "white" },
                    { label: "MC", bg: "#eb001b", color: "white" },
                    { label: "AMEX", bg: "#2e77bc", color: "white" },
                    { label: "UP", bg: "#e21836", color: "white" },
                    { label: "MIR", bg: "#019e3f", color: "white" },
                    { label: "••••", bg: "#888", color: "white" },
                  ].map(({ label, bg, color }) => (
                    <span
                      key={label}
                      style={{ background: bg, color }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </label>

              {/* PayPal */}
              <label
                className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 cursor-pointer transition-colors
                  ${payment === "paypal" ? "border-orange-500" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={payment === "paypal"}
                  onChange={() => setPayment("paypal")}
                  className="accent-orange-500 w-4 h-4 flex-shrink-0"
                />
                <span className="text-gray-900 text-sm font-semibold flex-1">PayPal</span>
                <span className="text-[#003087] font-black text-sm italic">Pay<span className="text-[#009cde]">Pal</span></span>
              </label>
            </div>

            {/* Right column */}
            <div>
              <h3 className="text-gray-900 text-base font-semibold mb-6 mt-14">3. Review your purchase</h3>

              {/* Product row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src={silhouette} alt="Artist" className="w-full h-full object-cover" />
                </div>
                <span className="text-gray-900 text-sm font-semibold">Artist Pro</span>
              </div>

              {/* Coupon */}
              <button
                onClick={() => setCouponOpen((p) => !p)}
                className="text-blue-600 text-sm hover:underline mb-4 block"
              >
                Do you have a coupon code?
              </button>
              {couponOpen && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                  />
                  <button className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm rounded-lg font-semibold transition-colors">
                    Apply
                  </button>
                </div>
              )}

              {/* Summary box */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-900 text-sm font-semibold">Total</span>
                  <span className="text-gray-900 text-sm font-bold">{total}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-3">
                  <span className="text-gray-500 text-sm">Billing cycle</span>
                  <span className="text-gray-700 text-sm">{cycle}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Subscription will automatically renew at {total} every {billing === "yearly" ? "year" : "month"}, starting{" "}
                  {billing === "yearly" ? "9 Apr 2027" : "9 May 2026"}, unless you cancel before the day of your next renewal in your subscription settings.
                </p>
                <p className="text-gray-400 text-xs mt-2">All prices in EGP</p>
              </div>

              {/* Buy button */}
              <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-colors mb-4">
                Buy subscription
              </button>

              <p className="text-gray-400 text-xs leading-relaxed">
                By submitting your payment information and clicking Buy subscription you agree to the{" "}
                <a href="#" className="text-blue-500 hover:underline">Terms of Use for Artist Subscriptions</a>
                {" "}and{" "}
                <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AmplifyModal({ onClose }: { onClose: () => void }) {
  const [showPurchase, setShowPurchase] = useState(false);

  if (showPurchase) {
    return <ArtistProPurchaseModal onClose={onClose} />;
  }

  return (
    <>
     <div className="fixed inset-0 z-50" style={{ background: "rgba(246, 235, 235, 0.58)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-black rounded-2xl w-[820px] overflow-hidden pointer-events-auto shadow-2xl relative">

          {/* Close button — top right corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top section: title + image side by side */}
          <div className="flex items-start justify-between px-10 pt-10 pb-4 gap-6">
            {/* Text */}
            <div className="flex-1">
              <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                Reach more listeners with Artist Pro
              </h2>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                In order to be eligible, you must have an Artist or Artist Pro subscription.
              </p>
              <p className="text-zinc-300 text-sm leading-relaxed">
                With an Artist Pro subscription you can have this track analyzed and recommended to reach{" "}
                <span className="text-white font-bold">100+ plays by listeners on SoundCloud.</span>
              </p>
            </div>

            {/* ↓ Replace this div with your <img> tag when ready */}
            <div className="w-70 h-44 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center">
             <img src={amplify} alt="Artist Pro" className="w-full h-full" />
            </div>
          </div>

          {/* Features box */}
          <div className="px-10 pb-6">
            <div className="bg-zinc-800/60 rounded-xl p-6">
              <p className="text-white text-sm font-bold mb-4">Upgrade to Artist Pro to get:</p>
              <ul className="space-y-3">
                {[
                  "Unlimited track recommendations",
                  "Unlimited uploads + replace tracks",
                  "Unlimited track distribution",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
  {/* Footer buttons */}
        <div className="flex items-center justify-start gap-4 px-10 pb-10">
              <button
                onClick={() => setShowPurchase(true)}
                className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors tracking-tight"
              >
                Unlock with Artist Pro
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-white text-sm font-semibold hover:text-zinc-300 transition-colors"
              >
              Maybe later
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

interface TrackCardProps {
  track: Track;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddToPlaylist?: (id: string) => void;
  onMonetize?: (id: string) => void;
  onMaster?: (id: string) => void;
  onDistribute?: (id: string) => void;
  onTrackInsights?: (id: string) => void;
  onDownload?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, danger = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors
        ${danger ? "text-red-400 hover:bg-zinc-700" : "text-zinc-200 hover:bg-zinc-700"}`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

export default function TrackCard({
  track,
  isSelected = false,
  onSelect,
  onEdit,
  onAddToPlaylist,
  onMonetize,
  onMaster,
  onDistribute,
  onTrackInsights,
  onDownload,
  onCopyLink,
  onDelete,
}: TrackCardProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAmplifyModal, setShowAmplifyModal] = useState(false);
  const [amplifyHovered, setAmplifyHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { currentTrack, isPlaying, setCurrentTrack, setIsPlaying } = usePlayer();
  const isThisTrack = currentTrack?.id === track.id;
  const playing = isThisTrack && isPlaying;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
       // thumbnailUrl: track.thumbnailUrl,
        duration: 0,
      });
      setIsPlaying(true);
    }
  };

  const fmt = (val: number | null | undefined) =>
    val === null || val === 0 || val === undefined ? "-" : val.toString();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className={`relative flex items-center gap-4 px-4 py-3 rounded transition-colors cursor-pointer overflow-visible
        ${hovered ? "bg-zinc-800" : "bg-zinc-900"}
        border border-transparent hover:border-zinc-700`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
    <button
      onClick={(e) => { e.stopPropagation(); onSelect?.(track.id); }}
      className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors
        ${isSelected
          ? "bg-white border-white"
          : "bg-transparent border-zinc-500 hover:border-white"
        }`}
    >
      {isSelected && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>

      {/* Thumbnail with hover play button */}
      <div
        className="relative w-12 h-12 flex-shrink-0 bg-zinc-700 rounded overflow-hidden group"
        onClick={handlePlayToggle}
      >
        {track.thumbnailUrl ? (
          <img
            src={track.thumbnailUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-700" />
        )}

        {/* Haze overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Play/pause button — always visible when playing, hover-only otherwise */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
          ${playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="black">
                <rect x="1" y="1" width="4" height="12" />
                <rect x="9" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="black">
                <polygon points="2,0 14,7 2,14" />
              </svg>
            )}
          </div>
        </div>

        {/* Lock badge */}
        {track.isPrivate && (
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 z-10">
            <Lock className="w-3 h-3 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-semibold truncate">{track.title}</span>
          {track.isHD && (
            <span className="text-xs font-bold text-white bg-zinc-600 px-1.5 py-0.5 rounded-sm leading-none">
              HD
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-xs mt-0.5 truncate">{track.artist}</p>
      </div>

      {/* Duration */}
      <div className="w-16 text-center">
        <span className="text-zinc-300 text-sm tabular-nums">{formatDuration(track.duration)}</span>
      </div>

      {/* Date — formatted as "Mar 10, 2026" */}
      <div className="w-28 text-center">
        <span className="text-zinc-300 text-sm">{formatDate(track.date)}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 w-52 justify-center">
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Heart className="w-3.5 h-3.5" />{fmt(track.likes)}
        </span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <MessageSquare className="w-3.5 h-3.5" />{fmt(track.comments)}
        </span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Repeat2 className="w-3.5 h-3.5" />{fmt(track.reposts)}
        </span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Download className="w-3.5 h-3.5" />{fmt(track.downloads)}
        </span>
      </div>

      {/* Plays */}
      <div className="w-16 text-right">
        <span className="text-white text-sm tabular-nums">{track.plays}</span>
      </div>

      {/* Amplify button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowAmplifyModal(true); }}
        onMouseEnter={() => setAmplifyHovered(true)}
        onMouseLeave={() => setAmplifyHovered(false)}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-semibold transition-all flex-shrink-0
          ${amplifyHovered ? "bg-indigo-700 opacity-80" : "bg-indigo-600"}`}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 1L9 6H14L10 9.5L11.5 14L7 11L2.5 14L4 9.5L0 6H5L7 1Z" fill="white" />
        </svg>
        Amplify
      </button>

      {/* More menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 bottom-full mb-1 z-50 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 overflow-hidden min-w-[180px] py-1">
            <MenuItem icon={<Pencil className="w-4 h-4" />} label="Edit" onClick={() => { onEdit?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<ListPlus className="w-4 h-4" />} label="Add to playlist" onClick={() => { onAddToPlaylist?.(track.id); setMenuOpen(false); }} />
            <div className="my-1 border-t border-zinc-700" />
            <MenuItem icon={<CircleDollarSign className="w-4 h-4" />} label="Monetize" onClick={() => { onMonetize?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<SlidersHorizontal className="w-4 h-4" />} label="Master" onClick={() => { onMaster?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Share2 className="w-4 h-4" />} label="Distribute" onClick={() => { onDistribute?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<TrendingUp className="w-4 h-4" />} label="Track insights" onClick={() => { onTrackInsights?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Download className="w-4 h-4" />} label="Download file" onClick={() => { onDownload?.(track.id); setMenuOpen(false); }} />
            <MenuItem icon={<Link className="w-4 h-4" />} label="Copy link" onClick={() => { onCopyLink?.(track.id); setMenuOpen(false); }} />
            <div className="my-1 border-t border-zinc-700" />
            <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete track" onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }} danger />
          </div>
        )}
      </div>

      {showAmplifyModal && (
        <AmplifyModal onClose={() => setShowAmplifyModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          track={track}
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={(id) => {
            setShowDeleteModal(false);
            onDelete?.(id);
          }}
        />
      )}
    </div>
  );
}