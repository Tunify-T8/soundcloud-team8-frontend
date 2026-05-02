import { useState } from "react";
import AuthNavbar from "../components/AuthNavbar";
import trackArtwork from "@/assets/track.jpg";
import uploadArtwork from "@/assets/upload.png";

type MobilePlatform = "ios" | "android";

function DevicePreview({
  frameClassName,
  screenClassName,
  artwork,
  alt,
}: {
  frameClassName: string;
  screenClassName: string;
  artwork: string;
  alt: string;
}) {
  return (
    <div
      className={`absolute rounded-[2.5rem] border-[3px] border-[#ff5500] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.45)] transition duration-300 hover:brightness-110 ${frameClassName}`}
    >
      <div className="absolute left-1/2 top-4 h-1.5 w-14 -translate-x-1/2 rounded-full bg-[#ff5500]/70" />
      <div className={`overflow-hidden rounded-[2rem] bg-black ${screenClassName}`}>
        <img
          src={artwork}
          alt={alt}
          className="h-full w-full object-cover transition duration-300"
        />
      </div>
    </div>
  );
}

export default function SignedOutPage() {
  const [platform, setPlatform] = useState<MobilePlatform>("ios");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <AuthNavbar />

      <main className="mx-auto flex max-w-[1400px] flex-col items-center px-6 pb-20 pt-16">
        <h1 className="text-center text-3xl font-black tracking-tight sm:text-5xl">
          You&apos;ve signed out. Now go mobile!
        </h1>

        <div className="mt-10 flex items-center gap-8 border-b border-zinc-700/80 text-2xl font-bold tracking-tight">
          <button
            type="button"
            onClick={() => setPlatform("ios")}
            className={`pb-4 transition-colors ${
              platform === "ios"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            iPhone and iPad
          </button>
          <button
            type="button"
            onClick={() => setPlatform("android")}
            className={`pb-4 transition-colors ${
              platform === "android"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Android
          </button>
        </div>

        <section className="mt-14 w-full max-w-[1280px]">
          {platform === "ios" ? (
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative h-[520px] overflow-hidden rounded-sm bg-[#f3f3f3]">
                <DevicePreview
                  frameClassName="left-[5%] top-[12%] h-[340px] w-[700px] -rotate-[10deg]"
                  screenClassName="mx-auto mt-8 h-[250px] w-[580px]"
                  artwork={trackArtwork}
                  alt="SoundCloud on iPad"
                />
                <DevicePreview
                  frameClassName="left-[40%] top-[48%] h-[170px] w-[340px] rotate-[8deg]"
                  screenClassName="mx-auto mt-5 h-[112px] w-[250px]"
                  artwork={uploadArtwork}
                  alt="SoundCloud on iPhone"
                />
              </div>

              <div className="flex flex-col justify-center">
                <p className="max-w-[420px] text-lg leading-8 text-zinc-300">
                  Keep listening on the go with the mobile app. Sign in again anytime from the top bar, or keep browsing this signed-out screen until you&apos;re ready.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-center lg:order-1">
                <p className="max-w-[420px] text-lg leading-8 text-zinc-300">
                  Your player stays paused after sign-out, and you can jump back in by using the navbar&apos;s sign-in action whenever you want.
                </p>
              </div>

              <div className="relative h-[520px] overflow-hidden rounded-sm bg-[#a3a3a3] lg:order-2">
                <DevicePreview
                  frameClassName="right-[2%] top-[10%] h-[360px] w-[640px] rotate-[11deg]"
                  screenClassName="mx-auto mt-8 h-[268px] w-[525px]"
                  artwork={trackArtwork}
                  alt="SoundCloud on Android tablet"
                />
                <DevicePreview
                  frameClassName="left-[16%] top-[48%] h-[210px] w-[220px] -rotate-[12deg]"
                  screenClassName="mx-auto mt-5 h-[150px] w-[150px]"
                  artwork={uploadArtwork}
                  alt="SoundCloud on Android phone"
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
