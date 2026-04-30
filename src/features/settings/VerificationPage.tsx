import { X, Zap } from "lucide-react";

const footerLinks = [
  "Legal",
  "Privacy",
  "Cookie Policy",
  "Cookie Manager",
  "Imprint",
  "Artist Resources",
  "Newsroom",
  "Charts",
  "Transparency Reports",
];

export default function VerificationPage() {
  return (
    <main className="min-h-screen bg-[var(--sc-bg)] pb-24 text-[var(--sc-text)]" data-testid="verification-page">
      <div className="mx-auto max-w-[1230px] px-4 pt-8 sm:px-6">
        <div className="mb-10 flex min-h-14 items-center justify-center border border-[var(--sc-border)] bg-[var(--sc-surface)] px-4 text-[13px] font-bold">
          <Zap size={20} className="mr-4 fill-purple-700 text-purple-700" aria-hidden="true" />
          <span>
            Uploading tracks just got way easier: upload, get heard, and get paid in one seamless experience.{" "}
            <a href="#" className="text-[#6699ff] hover:underline">
              Try it out
            </a>
          </span>
          <button type="button" className="ml-auto text-[var(--sc-text-secondary)] hover:text-[var(--sc-text)]" aria-label="Dismiss">
            <X size={24} />
          </button>
        </div>

        <section className="max-w-[1120px]">
          <h1 className="mb-7 text-[1.75rem] font-black" data-testid="verification-heading">
            Request verification
          </h1>
          <p className="mb-8 text-sm font-semibold leading-6" data-testid="verification-paragraph-1">
            Thank you for your interest in profile verification. We're currently working on updates to the verification process to provide an improved experience. During this time, we've temporarily paused accepting new applications, and pending applications are unable to be processed at this time.
          </p>
          <p className="text-sm font-semibold leading-6" data-testid="verification-paragraph-2">
            While we know this may be disappointing, we're confident that these upcoming changes will make the verification experience even more efficient and rewarding for creators on SoundCloud. We appreciate your patience as we work on these improvements, and can't wait to share updates with you soon. Stay tuned and thanks for being a part of the SoundCloud community!
          </p>
        </section>

        <footer className="pt-14 text-xs text-[var(--sc-text-secondary)]">
          <div className="flex flex-wrap items-center gap-1.5">
            {footerLinks.map((link, index) => (
              <span key={link} className="inline-flex items-center">
                <a href="#" className="hover:text-[var(--sc-text)]">
                  {link}
                </a>
                {index < footerLinks.length - 1 && <span className="mx-1">·</span>}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--sc-text)]">
            <span className="font-bold">Language:</span>{" "}
            <a href="#" className="text-[#2f7fdc] hover:underline">
              English (US)
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
