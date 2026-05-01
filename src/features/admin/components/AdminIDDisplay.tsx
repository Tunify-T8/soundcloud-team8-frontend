import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { getStoredUser } from '@/features/auth/utils/token.utils';

interface AdminIDDisplayProps {
  id: string;
  label?: string;
  className?: string;
  variant?: 'badge' | 'icon' | 'inline';
}

/**
 * Component to display IDs for admin users.
 * Only renders if the current user has an admin role.
 * Provides copy-to-clipboard functionality.
 */
export const AdminIDDisplay = ({
  id,
  label = 'ID',
  className = '',
  variant = 'badge',
}: AdminIDDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const user = useSelector((state: RootState) => state.user.currentUser);
  const storedUser = getStoredUser();
  const activeUser = user ?? storedUser;
  const isAdmin = activeUser?.role?.toLowerCase() === 'admin';

  // Only show if the current or stored user is an admin.
  if (!isAdmin) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2 py-1 bg-blue-900 bg-opacity-50 border border-blue-700 rounded text-[10px] text-blue-300 ${className}`}
        title={`${label}: ${id}`}
      >
        <span className="font-mono">{id.slice(0, 8)}...</span>
        <button
          onClick={handleCopy}
          className="p-0.5 hover:bg-blue-700 hover:bg-opacity-50 rounded transition"
          title="Copy ID"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
        </button>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={`relative group ${className}`}
        title={`Copy ${label}: ${id}`}
      >
        <Copy size={14} className="text-blue-400 hover:text-blue-300 transition" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-zinc-800 border border-zinc-700 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {copied ? 'Copied!' : `Copy ${label}`}
        </div>
      </button>
    );
  }

  // inline variant
  return (
    <span
      className={`font-mono text-[10px] text-blue-300 cursor-pointer hover:text-blue-200 transition ${className}`}
      onClick={handleCopy}
      title={`Click to copy ${label}: ${id}`}
    >
      {copied ? '✓ copied' : id}
    </span>
  );
};

export default AdminIDDisplay;
