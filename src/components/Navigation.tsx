"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, Newspaper, Bitcoin, Search, LogOut, User } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Image from "next/image";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/crypto", label: "Crypto", icon: Bitcoin },
    { href: "/screener", label: "Screener", icon: Search },
  ];

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                <Image 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5ce86b99-efea-482f-afa7-1dba4a2c8989/generated_images/modern-minimalist-financial-app-logo-ico-adaf047e-20251031104903.jpg"
                  alt="FinTrack Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                FinTrack
              </span>
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {isPending ? (
                <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-muted-foreground">
                      {session.user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-lg">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-around py-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary scale-105"
                        : "text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95"
                    }`}
                  >
                    <div className={`relative transition-all duration-300 ${
                      isActive ? "animate-bounce-subtle" : ""
                    }`}>
                      <Icon className={`h-6 w-6 transition-all duration-300 ${
                        isActive ? "fill-primary/20 stroke-[2.5]" : "stroke-[2]"
                      }`} />
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-all duration-300 ${
                      isActive ? "font-semibold" : ""
                    }`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}