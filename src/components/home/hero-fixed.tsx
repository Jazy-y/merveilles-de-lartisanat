"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Award,
  Heart,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    }
  };

  try {
    return (
      <section
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"
        suppressHydrationWarning={true}
      >
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 -z-20" suppressHydrationWarning={true}>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          >
            <source
              src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=139&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>
        </div>

        {/* Cinematic Overlay with Cultural Patterns */}
        <div className="absolute inset-0 -z-10" suppressHydrationWarning={true}>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, #D4AF37 2px, transparent 2px),
                               radial-gradient(circle at 80% 80%, #CD853F 2px, transparent 2px)`,
              backgroundSize: "60px 60px, 60px 60px",
              backgroundPosition: "0 0, 30px 30px",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-white/60"></div>
        </div>

        {/* Floating Cultural Elements */}
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          suppressHydrationWarning={true}
        >
          <div
            className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full animate-pulse"
            style={{
              transform: `translateY(${scrollY * 0.3}px) rotate(${
                scrollY * 0.1
              }deg)`,
              animation: "float 8s ease-in-out infinite",
            }}
          ></div>
          <div
            className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full"
            style={{
              transform: `translateY(${scrollY * 0.4}px) rotate(${
                -scrollY * 0.1
              }deg)`,
              animation: "float 8s ease-in-out infinite",
              animationDelay: "2s",
            }}
          ></div>
          <div
            className="absolute bottom-32 left-1/4 w-48 h-48 bg-gradient-to-br from-amber-200/25 to-orange-200/25 rounded-full"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              animation: "float 8s ease-in-out infinite",
              animationDelay: "4s",
            }}
          ></div>
        </div>

        {/* Video Controls */}
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-30 bg-black/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/40 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isVideoMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>

        {/* Main Content */}
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10"
          suppressHydrationWarning={true}
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
            suppressHydrationWarning={true}
          >
            {/* Cinematic Content */}
            <div
              className="space-y-12"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
                animation: "fadeInUp 1s ease-out",
              }}
              suppressHydrationWarning={true}
            >
              {/* Premium Badge */}
              <div
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-amber-200/50"
                suppressHydrationWarning={true}
              >
                <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
                <span
                  className="text-sm font-medium text-amber-800"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                  Artisanat Authentique de Tunisie
                </span>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>

              {/* Cinematic Heading */}
              <div className="space-y-8" suppressHydrationWarning={true}>
                <div className="flex items-center gap-6 mb-4">
                  <Image
                    src="/images/logo.png"
                    alt="Merveille Logo"
                    width={120}
                    height={60}
                    className="h-16 w-auto"
                    priority
                    suppressHydrationWarning={true}
                  />
                </div>
                <h1
                  className="text-6xl md:text-8xl font-bold leading-tight"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Merveilles
                  </span>
                  <br />
                  <span className="text-white drop-shadow-2xl">
                    de l&apos;Artisanat
                  </span>
                  <br />
                  <span
                    className="text-5xl md:text-6xl bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent"
                    style={{ fontFamily: "Amiri, serif" }}
                  >
                    de Tunisie
                  </span>
                </h1>
                <p
                  className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl drop-shadow-lg"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                  Découvrez des trésors artisanaux extraordinaires créés par des
                  maîtres artisans à travers la Tunisie. Chaque pièce incarne
                  des siècles de tradition, de savoir-faire et d&apos;héritage
                  culturel.
                </p>
              </div>

              {/* Cinematic CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-6"
                suppressHydrationWarning={true}
              >
                <Link href="/products">
                  <Button
                    className="relative overflow-hidden text-lg px-12 py-6 h-auto group bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                    size="lg"
                  >
                    <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Explorer la Collection
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    className="text-lg px-12 py-6 h-auto bg-white/20 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/30 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    size="lg"
                  >
                    Notre Histoire
                  </Button>
                </Link>
              </div>

              {/* Premium Stats with Cultural Elements */}
              <div
                className="grid grid-cols-3 gap-8 pt-12"
                suppressHydrationWarning={true}
              >
                <div
                  className="text-center group bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                  suppressHydrationWarning={true}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                    500+
                  </div>
                  <div
                    className="text-sm font-medium text-white/80 uppercase tracking-wide"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    Produits Artisanaux
                  </div>
                </div>
                <div
                  className="text-center group bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                  suppressHydrationWarning={true}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                    2.5K+
                  </div>
                  <div
                    className="text-sm font-medium text-white/80 uppercase tracking-wide"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    Clients Satisfaits
                  </div>
                </div>
                <div
                  className="text-center group bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                  suppressHydrationWarning={true}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                    75+
                  </div>
                  <div
                    className="text-sm font-medium text-white/80 uppercase tracking-wide"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    Maîtres Artisans
                  </div>
                </div>
              </div>
            </div>

            {/* Cinematic Image Gallery */}
            <div
              className="relative"
              style={{
                transform: `translateY(${scrollY * -0.1}px)`,
                animation: "scaleIn 0.8s ease-out",
              }}
              suppressHydrationWarning={true}
            >
              {/* Main Showcase */}
              <div
                className="relative z-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
                suppressHydrationWarning={true}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Poterie artisanale tunisienne"
                    width={1000}
                    height={1000}
                    className="w-full h-96 object-cover hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-500">
                    <p
                      className="text-lg"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                      Poterie de Nabeul
                    </p>
                    <p className="text-sm opacity-80">Tradition millénaire</p>
                  </div>
                </div>
              </div>

              {/* Floating Cultural Badges */}
              <div
                className="absolute -top-8 -right-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-amber-200/20"
                style={{ animation: "float 8s ease-in-out infinite" }}
                suppressHydrationWarning={true}
              >
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-amber-600 animate-pulse" />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">
                      Patrimoine UNESCO
                    </span>
                    <span className="text-xs text-gray-600">
                      Certifié Authentique
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-amber-200/20"
                style={{
                  animation: "float 8s ease-in-out infinite",
                  animationDelay: "2s",
                }}
                suppressHydrationWarning={true}
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-red-500 animate-pulse" />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">
                      Fait à la Main
                    </span>
                    <span className="text-xs text-gray-600">Avec Passion</span>
                  </div>
                </div>
              </div>

              {/* Floating Gallery Items */}
              <div
                className="absolute top-1/2 -left-12 w-28 h-28 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/20 overflow-hidden hover:scale-110 transition-transform duration-300"
                style={{
                  animation: "float 8s ease-in-out infinite",
                  animationDelay: "1s",
                }}
                suppressHydrationWarning={true}
              >
                <Image
                  src="https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  alt="Céramiques tunisiennes"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="absolute top-1/4 -right-12 w-24 h-24 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/20 overflow-hidden hover:scale-110 transition-transform duration-300"
                style={{
                  animation: "float 8s ease-in-out infinite",
                  animationDelay: "3s",
                }}
                suppressHydrationWarning={true}
              >
                <Image
                  src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  alt="Textiles tunisiens"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic Scroll Indicator */}
        <div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce z-20"
          suppressHydrationWarning={true}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center backdrop-blur-sm">
              <div className="w-1 h-4 bg-white/80 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span
              className="text-white/60 text-xs tracking-wide"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Découvrir
            </span>
          </div>
        </div>

        {/* Add keyframe animations via style tag */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </section>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error("🚨 Hero component error:", error);
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Hero Section Error
          </h1>
          <p className="text-gray-600">
            Something went wrong loading the hero section
          </p>
        </div>
      </section>
    );
  }
}