"use client";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Topbar = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const topRoutes = [
    { label: "Instructor", path: "/instructor/courses" },
    { label: "Learning", path: "/learning" },
  ];
  const sidebarRoutes = [
    { label: "Courses", path: "/instructor/courses" },
    {
      label: "Performance",
      path: "/instructor/performance",
    },
  ];
  const [searchInput, setSearchInput] = useState("");
  const handleSearch = () => {
    if (searchInput.trim() !== "") {
      router.push(`/search?query=${searchInput}`);
    }
    setSearchInput("");
  };
  return (
    <div className="flex justify-between items-center  p-4">
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={200} height={200} />
      </Link>
      <div className="max-md:hidden w-[400px] rounded-full flex">
        <input
          type="text"
          className="flex-grow rounded-l-full border-none outline-none text-sm pl-4 py-3 shadow-sm bg-pink-300/10"
          placeholder="Search for courses..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          className="bg-pink-300 rounded-r-full border-none outline-none px-4 py-3 hover:bg-pink-300/80 shadow-sm"
          onClick={handleSearch}
          disabled={searchInput.trim() === ""}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-6 items-center">
        <div className="max-sm:hidden flex gap-6 ">
          {topRoutes.map((route) => (
            <Link
              href={route.path}
              key={route.path}
              className="text-sm font-medium hover:text-pink-300"
            >
              {route.label}
            </Link>
          ))}
        </div>
        <div className="w-full max-w-[200px] z-20 sm:hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {topRoutes.map((route) => (
                  <Link
                    href={route.path}
                    key={route.path}
                    className="text-sm font-medium hover:text-pink-300"
                  >
                    {route.label}
                  </Link>
                ))}
              </div>
              {pathname.startsWith("/instructor") && (
                <div className="flex flex-col gap-4">
                  {sidebarRoutes.map((route) => (
                    <Link
                      href={route.path}
                      key={route.path}
                      className="text-sm font-medium hover:text-pink-300"
                    >
                      {route.label}
                    </Link>
                  ))}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/sign-in" />
        ) : (
          <Link href="/sign-in">
            <Button> Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Topbar;
