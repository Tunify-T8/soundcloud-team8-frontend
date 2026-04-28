import { useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent } from "react";
import CheckoutModal from "@/features/premium/components/CheckoutModal";
import { useMe } from "@/features/profile/context/useMe";

type ArtistProUpgradeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function ArtistProUpgradeButton({
  children,
  onClick,
  type = "button",
  ...props
}: ArtistProUpgradeButtonProps) {
  const { subscription } = useMe();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (subscription.tier === "artist-pro") {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <>
      <button {...props} type={type} onClick={handleClick}>
        {children}
      </button>
      {checkoutOpen && (
        <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />
      )}
    </>
  );
}
