"use client";

import Link from "next/link";
import React from "react";
import Container from "./Container";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Toaster, toast } from "sonner";

const NavigationBar = () => {
  const { data: session, status } = useSession();
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Ask",
      link: "/ask",
    },
  ]; 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out successfully");
  };

  return (
    <header className="flex justify-center items-center">
      <Container>
        <div className="relative w-full">
          <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
              <NavbarLogo />
              <NavItems items={navItems} />
              <div className="flex items-center gap-4">
                {status === "unauthenticated" && (
                  <>
                    <Link href="/sign-in">
                      <NavbarButton variant="secondary">LogIn</NavbarButton>
                    </Link>
                    <Link href="/sign-up">
                      <NavbarButton variant="primary">Sign Up</NavbarButton>
                    </Link>
                  </>
                )}

                {status === "authenticated" && session?.user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-black text-white">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer"
                      >
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                      >
                        <Link href="/notifications">Notifications</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav>
              <MobileNavHeader>
                <NavbarLogo />
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </MobileNavHeader>

              <MobileNavMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
              >
                {navItems.map((item, idx) => (
                  <Link
                    key={`mobile-link-${idx}`}
                    href={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative text-neutral-600"
                  >
                    <span className="block">{item.name}</span>
                  </Link>
                ))}
                <div className="flex w-full flex-col gap-4">
                  {status === "unauthenticated" && (
                    <>
                      <Link href="/sign-in">
                        <NavbarButton
                          onClick={() => setIsMobileMenuOpen(false)}
                          variant="outline"
                          className="w-full"
                        >
                          LogIn
                        </NavbarButton>
                      </Link>
                      <Link href="/sign-up">
                        <NavbarButton
                          onClick={() => setIsMobileMenuOpen(false)}
                          variant="primary"
                          className="w-full"
                        >
                          SignUp
                        </NavbarButton>
                      </Link>
                    </>
                  )}

                  {status === "authenticated" && (
                    <NavbarButton
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Sign Out
                    </NavbarButton>
                  )}
                </div>
              </MobileNavMenu>
            </MobileNav>
          </Navbar>
        </div>
      </Container>
      <Toaster position="top-center" />
    </header>
  );
};

export default NavigationBar;
