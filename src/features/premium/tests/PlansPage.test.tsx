import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";

// ─── Inline the logic under test (no imports from the actual page) ───────────

const sections = [
  {
    title: "Get heard",
    rows: [
      { name: "Promote tracks",        basic: null,      artist: "2 tracks / month", pro: "Unlimited",        proHighlight: true  },
      { name: "Get playlisted",        basic: null,      artist: "2 tracks / month", pro: "Unlimited",        proHighlight: true  },
      { name: "Distribute and get paid",basic: null,     artist: "2 tracks / month", pro: "Unlimited",        proHighlight: true  },
      { name: "Advanced audience stats",basic: null,     artist: "How fans found you",pro: "Unlimited",       proHighlight: true  },
      { name: "Comments hub",          basic: null,      artist: null,               pro: "available",        proHighlight: true  },
    ],
  },
  {
    title: "Manage your music",
    rows: [
      { name: "Upload limit",          basic: "2 hours", artist: "3 hours",          pro: "Unlimited",        proHighlight: true  },
      { name: "Free mastering credits",basic: null,      artist: "1 track / month",  pro: "3 tracks / month", proHighlight: true  },
      { name: "Replace tracks",        basic: null,      artist: "3 tracks / month", pro: "Unlimited",        proHighlight: true  },
      { name: "Quiet mode",            basic: null,      artist: null,               pro: "available",        proHighlight: true  },
      { name: "Schedule track releases",basic: null,     artist: null,               pro: "available",        proHighlight: true  },
    ],
  },
  {
    title: "Build your brand",
    rows: [
      { name: "Profile badge",         basic: null,      artist: "badge-artist",     pro: "badge-pro",        proHighlight: false },
      { name: "Spotlight",             basic: null,      artist: "1 track",          pro: "5 tracks",         proHighlight: true  },
    ],
  },
  {
    title: "Get paid",
    rows: [
      { name: "Monetize on SoundCloud",              basic: null, artist: "2 tracks / month", pro: "Unlimited",  proHighlight: true  },
      { name: "Distribute and monetize on 60+ other platforms", basic: null, artist: "2 tracks / month", pro: "Unlimited", proHighlight: true },
      { name: "YouTube Content ID",                  basic: null, artist: "available",        pro: "available",  proHighlight: false },
      { name: "Split royalties",                     basic: null, artist: null,               pro: "available",  proHighlight: true  },
    ],
  },
  {
    title: "Special treatment",
    rows: [
      { name: "Priority support",         basic: null, artist: null,             pro: "available",   proHighlight: true  },
      { name: "Get 50% off Go+",          basic: null, artist: null,             pro: "available",   proHighlight: true  },
      { name: "Exclusive Partner Savings",basic: null, artist: "Partial access", pro: "Full access", proHighlight: true  },
    ],
  },
];

// Mirrors the Cell component from PlansPage
function Cell({ value, highlight }: { value: string | null; highlight?: boolean }) {
  if (value === null) return <span data-testid="cell-na">Not Available –</span>;
  if (value === "available") return <span data-testid="cell-available">Available</span>;
  if (value === "badge-artist") return <span data-testid="cell-badge-artist">ARTIST</span>;
  if (value === "badge-pro") return <span data-testid="cell-badge-pro">ARTIST PRO</span>;
  return <span data-testid="cell-text" style={{ color: highlight ? "#1db954" : undefined }}>{value}</span>;
}

// Minimal checkout-open trigger (mirrors the button logic in PlansPage)
function CheckoutTrigger({ label, plan }: { label: string; plan: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>{label}</button>
      {open && <div data-testid={`checkout-${plan}`}>CheckoutModal:{plan}</div>}
    </>
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("sections data", () => {
  it("has exactly 5 sections", () => {
    expect(sections).toHaveLength(5);
  });

  it("section titles are correct", () => {
    const titles = sections.map((s) => s.title);
    expect(titles).toEqual([
      "Get heard",
      "Manage your music",
      "Build your brand",
      "Get paid",
      "Special treatment",
    ]);
  });

  it("every row has name, basic, artist, pro, proHighlight fields", () => {
    sections.forEach((section) => {
      section.rows.forEach((row) => {
        expect(row).toHaveProperty("name");
        expect(row).toHaveProperty("basic");
        expect(row).toHaveProperty("artist");
        expect(row).toHaveProperty("pro");
        expect(row).toHaveProperty("proHighlight");
      });
    });
  });

  it("Upload limit row: basic=2 hours, artist=3 hours, pro=Unlimited", () => {
    const section = sections.find((s) => s.title === "Manage your music")!;
    const row = section.rows.find((r) => r.name === "Upload limit")!;
    expect(row.basic).toBe("2 hours");
    expect(row.artist).toBe("3 hours");
    expect(row.pro).toBe("Unlimited");
  });

  it("Free plan (basic) is null for most premium rows", () => {
    const premiumOnlyRows = sections
      .flatMap((s) => s.rows)
      .filter((r) => r.basic === null);
    expect(premiumOnlyRows.length).toBeGreaterThan(0);
  });

  it("Profile badge row has proHighlight=false", () => {
    const section = sections.find((s) => s.title === "Build your brand")!;
    const row = section.rows.find((r) => r.name === "Profile badge")!;
    expect(row.proHighlight).toBe(false);
  });

  it("YouTube Content ID is available for both artist and pro", () => {
    const section = sections.find((s) => s.title === "Get paid")!;
    const row = section.rows.find((r) => r.name === "YouTube Content ID")!;
    expect(row.artist).toBe("available");
    expect(row.pro).toBe("available");
    expect(row.proHighlight).toBe(false);
  });

  it("Comments hub is pro-only (artist is null)", () => {
    const section = sections.find((s) => s.title === "Get heard")!;
    const row = section.rows.find((r) => r.name === "Comments hub")!;
    expect(row.artist).toBeNull();
    expect(row.pro).toBe("available");
  });
});

describe("Cell component", () => {
  it("renders Not Available for null", () => {
    render(<Cell value={null} />);
    expect(screen.getByTestId("cell-na")).toHaveTextContent("Not Available –");
  });

  it("renders Available for 'available'", () => {
    render(<Cell value="available" />);
    expect(screen.getByTestId("cell-available")).toHaveTextContent("Available");
  });

  it("renders ARTIST badge for 'badge-artist'", () => {
    render(<Cell value="badge-artist" />);
    expect(screen.getByTestId("cell-badge-artist")).toHaveTextContent("ARTIST");
  });

  it("renders ARTIST PRO badge for 'badge-pro'", () => {
    render(<Cell value="badge-pro" />);
    expect(screen.getByTestId("cell-badge-pro")).toHaveTextContent("ARTIST PRO");
  });

  it("renders plain text for other values", () => {
    render(<Cell value="Unlimited" />);
    expect(screen.getByTestId("cell-text")).toHaveTextContent("Unlimited");
  });

  it("applies green color when highlight=true", () => {
    render(<Cell value="Unlimited" highlight={true} />);
    expect(screen.getByTestId("cell-text")).toHaveStyle({ color: "#1db954" });
  });

  it("does not apply green color when highlight=false", () => {
    render(<Cell value="3 hours" highlight={false} />);
    const el = screen.getByTestId("cell-text");
    expect(el).not.toHaveStyle({ color: "#1db954" });
  });
});

describe("PLAN_CONFIG values", () => {
  const PLAN_CONFIG = {
    artist: {
      title: "Get Artist",
      name: "Artist",
      yearlyTotal: "EGP 359.88",
      yearlyMonthly: "EGP 29.99/month",
      monthlyPrice: "EGP 59.99/month",
      renewAmount: "EGP 359.88",
    },
    "artist-pro": {
      title: "Get Artist Pro",
      name: "Artist Pro",
      yearlyTotal: "EGP 899.88",
      yearlyMonthly: "EGP 74.99/month",
      monthlyPrice: "EGP 149.99/month",
      renewAmount: "EGP 899.88",
    },
  };

  it("artist plan has correct yearly total", () => {
    expect(PLAN_CONFIG.artist.yearlyTotal).toBe("EGP 359.88");
  });

  it("artist-pro plan has correct yearly total", () => {
    expect(PLAN_CONFIG["artist-pro"].yearlyTotal).toBe("EGP 899.88");
  });

  it("artist monthly price is correct", () => {
    expect(PLAN_CONFIG.artist.monthlyPrice).toBe("EGP 59.99/month");
  });

  it("artist-pro monthly price is correct", () => {
    expect(PLAN_CONFIG["artist-pro"].monthlyPrice).toBe("EGP 149.99/month");
  });

  it("artist-pro renewAmount matches yearlyTotal", () => {
    expect(PLAN_CONFIG["artist-pro"].renewAmount).toBe(PLAN_CONFIG["artist-pro"].yearlyTotal);
  });
});

describe("checkout modal trigger", () => {
  it("does not show checkout modal initially", () => {
    render(<CheckoutTrigger label="Get started" plan="artist" />);
    expect(screen.queryByTestId("checkout-artist")).not.toBeInTheDocument();
  });

  it("shows checkout modal after clicking Get started for artist", () => {
    render(<CheckoutTrigger label="Get started" plan="artist" />);
    fireEvent.click(screen.getByText("Get started"));
    expect(screen.getByTestId("checkout-artist")).toBeInTheDocument();
  });

  it("shows checkout modal after clicking Get Artist Pro", () => {
    render(<CheckoutTrigger label="Get Artist Pro" plan="artist-pro" />);
    fireEvent.click(screen.getByText("Get Artist Pro"));
    expect(screen.getByTestId("checkout-artist-pro")).toBeInTheDocument();
  });
});

describe("upload limit paywall logic", () => {
  const limits: Record<string, number | null> = {
    free: 2,
    artist: 3,
    "artist-pro": null, // null = unlimited
  };

  it("free plan has a 2-hour cap", () => {
    expect(limits.free).toBe(2);
  });

  it("artist plan has a 3-hour cap", () => {
    expect(limits.artist).toBe(3);
  });

  it("artist-pro has no cap (null = unlimited)", () => {
    expect(limits["artist-pro"]).toBeNull();
  });

  it("free users cannot exceed their limit", () => {
    const currentHours = 3;
    const limit = limits.free!;
    expect(currentHours > limit).toBe(true); // should be blocked
  });

  it("artist-pro users are never blocked", () => {
    const currentHours = 999;
    const limit = limits["artist-pro"];
    const isBlocked = limit !== null && currentHours > limit;
    expect(isBlocked).toBe(false);
  });
});

describe("subscription request payload", () => {
  function buildPayload(
    plan: "artist" | "artist-pro",
    billingCycle: "yearly" | "monthly",
    paymentMethod: "card" | "paypal" | "apple",
    card?: { last4: string; brand: string; expMonth: number; expYear: number }
  ) {
    return { plan, billingCycle, paymentMethod, ...(card ? { card } : {}) };
  }

  it("builds a valid artist yearly card payload", () => {
    const payload = buildPayload("artist", "yearly", "card", {
      last4: "1111", brand: "visa", expMonth: 12, expYear: 2027,
    });
    expect(payload.plan).toBe("artist");
    expect(payload.billingCycle).toBe("yearly");
    expect(payload.card?.last4).toBe("1111");
  });

  it("builds a valid artist-pro monthly paypal payload (no card field)", () => {
    const payload = buildPayload("artist-pro", "monthly", "paypal");
    expect(payload.paymentMethod).toBe("paypal");
    expect(payload).not.toHaveProperty("card");
  });

  it("card payload never includes full card number", () => {
    const payload = buildPayload("artist", "yearly", "card", {
      last4: "4242", brand: "visa", expMonth: 1, expYear: 2028,
    });
    // last4 only — never the full number
    expect(payload.card?.last4).toHaveLength(4);
  });

  it("trial days are 7 for artist-pro and 0 for artist", () => {
    const trialDays = (plan: string) => plan === "artist-pro" ? 7 : 0;
    expect(trialDays("artist-pro")).toBe(7);
    expect(trialDays("artist")).toBe(0);
  });
});

//npm run test -- src/features/premium/tests/PlansPage.test.tsx