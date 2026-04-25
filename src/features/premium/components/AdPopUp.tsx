import { useAdPopup } from "@/hooks/useAdPopUp";
import { useSubscription } from "@/hooks/useSubscription";
import { useState, useEffect } from "react";
import CheckoutModal from "./CheckoutModal";
import adImg from "@/assets/ad.png";
import adImg2 from "@/assets/go_pro.png";

const AD_IMAGES = [adImg, adImg2];

export function AdPopup() {
  const { isOpen, dismiss } = useAdPopup();
  const { tier } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAdIndex((prev) => (prev + 1) % AD_IMAGES.length);
    }
  }, [isOpen]);

  // CheckoutModal lives outside the isOpen gate so it renders independently
  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={dismiss}
        >
          <div
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              maxWidth: "380px",
              width: "100%",
              position: "relative",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                zIndex: 10,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.45)",
                border: "none",
                color: "#fff",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <img
              src={AD_IMAGES[adIndex]}
              alt="Advertisement"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxHeight: "420px",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                background: "#111",
                padding: "0.875rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <p style={{ fontSize: "0.78rem", color: "#aaa", margin: 0, flex: 1 }}>
                You're on the{" "}
                <strong style={{ color: "#fff" }}>{tier}</strong> plan.{" "}
                Upgrade to remove ads.
              </p>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={dismiss}
                  style={{
                    padding: "0.5rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #333",
                    background: "none",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Continue with ads
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss();           // close the ad
                    setCheckoutOpen(true); // open checkout separately
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.55rem 1.1rem",
                    borderRadius: "8px",
                    border: "1px solid #a0742a",
                    background: "linear-gradient(135deg, #c9922a 0%, #e8c96a 50%, #b87e20 100%)",
                    color: "#1a0f00",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 12px rgba(200,150,40,0.4)",
                    letterSpacing: "0.02em",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3.5l1.5 3 3.3.5-2.4 2.3.6 3.2L12 13l-3 1.5.6-3.2L7.2 9l3.3-.5L12 5.5z"/>
                  </svg>
                  Go Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <CheckoutModal plan="artist-pro" onClose={() => setCheckoutOpen(false)} />
      )}
    </>
  );
}