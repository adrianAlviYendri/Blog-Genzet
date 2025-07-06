"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { User, LogOut, ChevronDown, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminNavbarProps {
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  toggleSidebar: () => void;
  title: string;
}

function getCookie(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export default function AdminNavbar({
  isDropdownOpen,
  toggleDropdown,
  toggleSidebar,
  title,
}: AdminNavbarProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      if (!token) {
        console.log("No token found in cookies");
        router.push("/login");
        return;
      }

      const { data } = await axios.get<ProfileResponse>(
        "https://test-fe.mysellerpintar.com/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(data);
      console.log("Profile loaded:", data);
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        toggleDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, toggleDropdown]);

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-700 hover:text-gray-900 mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-colors duration-200"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                ) : (
                  profile?.username || "Admin"
                )}
              </div>
              <div className="text-xs text-gray-600">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-3 w-12 rounded mt-1"></div>
                ) : (
                  profile?.role || "Administrator"
                )}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 text-gray-600 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                ) : (
                  profile?.username || "Admin"
                )}
              </div>
              <div className="text-xs text-gray-600">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-3 w-16 rounded mt-1"></div>
                ) : (
                  profile?.role || "Administrator"
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
