import Link from 'next/link'
import { LinkedInLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="bg-background border-b border-border py-4 px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-lg font-bold text-foreground">TaroGPT</span>
        </Link>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">Connect with Taro</span>
          <Link
            href="https://www.linkedin.com/in/tarocasalino/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogoIcon className="w-6 h-6" />
          </Link>
          <Link
            href="https://github.com/fabiotaroc"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubLogoIcon className="w-6 h-6" />
          </Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
