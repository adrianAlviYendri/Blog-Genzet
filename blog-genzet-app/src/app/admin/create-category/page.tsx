"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import axios from "axios";
import AdminSidebar from "@/Components/SideBar";
import CategoryForm from "@/Components/CategoryForm";

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const getCookie = useCallback((name: string): string | undefined => {
    if (typeof window === "undefined") return undefined;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const token = getCookie("token");

      if (!token) {
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

      if (data.role !== "Admin") {
        router.push("/user");
        return;
      }
    } catch (error: unknown) {
      console.error("Profile fetch error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Clear cookies on client side only
        if (typeof window !== "undefined") {
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        router.push("/login");
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, [router, getCookie]);

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      const token = getCookie("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post(
        "https://test-fe.mysellerpintar.com/api/categories",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      router.push("/admin/categories");
    } catch (error: unknown) {
      console.error("Category creation error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBackToCategories = () => {
    router.push("/admin/categories");
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeMenu="categories"
        />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu="categories"
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToCategories}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Categories</span>
            </button>
            <div className="flex items-center">
              <Tag className="w-5 h-5 text-gray-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Create New Category
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create New Category
              </h2>
              <p className="text-gray-600">
                Add a new category to organize your articles better.
              </p>
            </div>

            <CategoryForm
              mode="create"
              onSubmit={handleCreateCategory}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
