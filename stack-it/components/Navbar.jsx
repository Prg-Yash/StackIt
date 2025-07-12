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

const NavigationBar = () => {
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

  return (
    <header className="flex justify-center items-center">
      <Container>
        <div className="relative w-full">
          <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
              <NavbarLogo />
              {/* TODO: Add Auth based NavItems */}
              <NavItems
                items={navItems} 
              />
              <div className="flex items-center gap-4">
                {/* TODO: SignedOut Logic (Login/SignUp Buttons) */}
                {/* <SignedOut>
                  <SignInButton>
                    <NavbarButton variant="secondary">LogIn</NavbarButton>
                  </SignInButton>
                  <SignUpButton>
                    <NavbarButton variant="primary">Sign Up</NavbarButton>
                  </SignUpButton>
                </SignedOut> */}

                {/* TODO: SignedIn Logic (Profile & Notifications Button) */}
                {/* <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: "3rem",
                          height: "3rem",
                        },
                      },
                    }}
                  />
                </SignedIn> */}
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
                {/* TODO: SignedOut Logic for Mobile (Login/SignUp Buttons) */}
                  {/* <SignedOut>
                    <SignInButton>
                      <NavbarButton
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="outline"
                        className="w-full"
                      >
                        LogIn
                      </NavbarButton>
                    </SignInButton>
                    <SignUpButton>
                      <NavbarButton
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="primary"
                        className="w-full"
                      >
                        SignUp
                      </NavbarButton>
                    </SignUpButton>
                  </SignedOut> */}

                {/* TODO: SignedIn Logic for Mobile (Profile & Notifications Button) */}
                  {/* <SignedIn>
                    <Link href="/my-account">
                      <NavbarButton
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="primary"
                        className="w-full"
                      >
                        My Account
                      </NavbarButton>
                    </Link>
                  </SignedIn> */}
                </div>
              </MobileNavMenu>
            </MobileNav>
          </Navbar>
        </div>
      </Container>
    </header>
  );
};

export default NavigationBar;
