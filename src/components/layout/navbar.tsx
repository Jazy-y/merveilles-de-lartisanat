"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, Menu, X, Heart, Settings } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const { state: cartState } = useCart();

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <nav
      className="bg-card/98 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border"
      suppressHydrationWarning={true}
    >
        <div
          className="max-w-7xl mx-auto px-0"
          suppressHydrationWarning={true}
        >
        <div
          className="flex justify-between items-center h-20"
          suppressHydrationWarning={true}
        >
          {/* Logo: readable size on mobile, full size on desktop */}
          <Link
            href="/"
            className="flex items-center group ml-1 md:ml-0 min-w-0 flex-1 md:flex-initial"
            suppressHydrationWarning={true}
          >
            <div className="relative min-w-0">
              <span className="block text-base sm:text-lg md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 whitespace-nowrap" style={{ fontFamily: 'Playfair Display, serif' }}>
                Merveilles de l&apos;Artisanat
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div
            className="hidden md:flex items-center space-x-6"
            suppressHydrationWarning={true}
          >
            <Link
              href="/products"
              className="relative text-muted-foreground hover:text-primary transition-all duration-300 font-medium group"
            >
              Boutique
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/about"
              className="relative text-muted-foreground hover:text-primary transition-all duration-300 font-medium group"
            >
              À propos
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/contact"
              className="relative text-muted-foreground hover:text-primary transition-all duration-300 font-medium group"
            >
              Contact
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          </div>

          {/* Right actions */}
          <div
            className="hidden md:flex items-center space-x-2 relative"
            suppressHydrationWarning={true}
          >
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-3 hover:bg-muted transition-all duration-300 group"
              >
                <Heart className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-3 hover:bg-muted transition-all duration-300 group"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                {cartState.itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-0">
                    {cartState.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <div onClick={handleUserMenuClick}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 p-3 hover:bg-muted transition-all duration-300 group relative"
                      type="button"
                    >
                      <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="hidden sm:block text-sm font-medium text-foreground">
                        {user?.name || user?.email || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-popover border border-border shadow-lg"
                    align="end"
                    sideOffset={5}
                    style={{ zIndex: 9999 }}
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 text-sm hover:bg-muted transition-colors w-full"
                      >
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/orders"
                        className="flex items-center px-3 py-2 text-sm hover:bg-muted transition-colors w-full"
                      >
                        Commandes
                      </Link>
                    </DropdownMenuItem>
                    {(user as any)?.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex items-center px-3 py-2 text-sm hover:bg-muted transition-colors w-full"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center px-3 py-2 text-sm hover:bg-muted text-destructive cursor-pointer"
                    >
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex space-x-3" suppressHydrationWarning={true}>
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted transition-none"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="text-sm px-6 py-2 h-auto">
                    S&apos;inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + wishlist + menu button (compact for logo space) */}
          <div className="md:hidden flex items-center shrink-0 gap-0.5" suppressHydrationWarning={true}>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-muted">
                <Heart className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-muted">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                {cartState.itemCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center px-1 text-[10px] bg-primary text-primary-foreground border-0">
                    {cartState.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-9 w-9 hover:bg-muted transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-card border-t border-border shadow-sm">
              <Link
                href="/products"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Boutique
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-3 text-sm text-muted-foreground bg-muted rounded-lg">
                      Bienvenue, {user?.name || user?.email || "Utilisateur"}!
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Commandes
                    </Link>
                    {(user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-destructive hover:bg-muted rounded-lg transition-all duration-300 font-medium"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-none font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-300 font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}