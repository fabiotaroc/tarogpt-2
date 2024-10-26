import Link from 'next/link'
import { LinkedInLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import { SignedIn, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="border-b border-border py-4 px-6 shrink-0 bg-gradient-to-b from-background/40 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="container max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-foreground">TaroGPT</span>
          </Link>
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
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
