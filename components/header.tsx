"use client";

import Link from "next/link";
import {
  LinkedInLogoIcon,
  GitHubLogoIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoBox } from "@/components/info-box";
import { ModeToggle } from "@/components/ui/mode-toggle";

export function Header() {
  return (
    <header className="sticky top-0 bg-background/95 border-b py-4 px-6 shrink-0 backdrop-blur-xl z-50">
      <div className="container max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-foreground">TaroGPT</span>
          </Link>
          <Popover>
            <PopoverTrigger>
              <InfoCircledIcon className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-full p-0">
              <InfoBox />
            </PopoverContent>
          </Popover>
          <Link
            href="https://github.com/fabiotaroc"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubLogoIcon className="w-6 h-6" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/tarocasalino/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogoIcon className="w-6 h-6" />
          </Link>
          <ModeToggle />
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
