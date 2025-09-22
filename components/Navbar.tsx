
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import SyncUserOnSignIn from "./SyncUserOnSignIn";

const Navbar = () => {

    const { isSignedIn } = useUser();
  return (
    <header className="shadow-md w-full bg-cyan-100">
      <nav className="max-w-6xl mx-auto p-4 flex justify-between items-center">
       
        <div className="text-2xl font-bold text-cyan-900">
          <Link href="/">AI Yoga</Link>
        </div>

        {/* Links */}
        <ul className="hidden md:flex space-x-6 text-cyan-800 font-medium">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/meditation">Meditation</Link>
          </li>
          <li>
            <Link href="/notifications">Notifications</Link>
          </li>
        </ul>

        {/* Auth Section */}
        <div className="flex items-center space-x-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
      {isSignedIn && <SyncUserOnSignIn />}
    </header>
  );
};

export default Navbar;
