"use client";

import { useRouter } from "next/navigation";
import { Newspaper, User, Tag, FileText, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeMenu: "articles" | "categories";
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export default function AdminSidebar({
  isSidebarOpen,
  toggleSidebar,
  activeMenu,
}: AdminSidebarProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const handleArticlesPage = () => {
    router.push("/admin");
  };

  const handleCategoriesPage = () => {
    router.push("/admin/categories");
  };

  const fetchProfile = useCallback(async () => {
    try {
      const token = getCookie("token");

      if (!token) {
        console.log("No token found");
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

      if (data.role !== "Admin") {
        router.push("/user");
        return;
      }
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <>
      {/* Fixed Sidebar for all screen sizes */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-600 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <Newspaper className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-white font-bold text-lg">Blog Genzet</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-6 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">
                  {profile?.username || "Admin"}
                </div>
                <div className="text-blue-200 text-sm">
                  {profile?.role || "Administrator"}
                </div>
              </div>
            </div>
          </div>

          <ul className="space-y-2 px-4">
            <li>
              {activeMenu === "articles" ? (
                <div className="flex items-center px-4 py-3 text-white bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5 mr-3" />
                  <span className="font-medium">Articles</span>
                </div>
              ) : (
                <button
                  onClick={handleArticlesPage}
                  className="w-full flex items-center px-4 py-3 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors duration-200"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  <span>Articles</span>
                </button>
              )}
            </li>
            <li>
              {activeMenu === "categories" ? (
                <div className="flex items-center px-4 py-3 text-white bg-blue-500 rounded-lg">
                  <Tag className="w-5 h-5 mr-3" />
                  <span className="font-medium">Categories</span>
                </div>
              ) : (
                <button
                  onClick={handleCategoriesPage}
                  className="w-full flex items-center px-4 py-3 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors duration-200"
                >
                  <Tag className="w-5 h-5 mr-3" />
                  <span>Categories</span>
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
