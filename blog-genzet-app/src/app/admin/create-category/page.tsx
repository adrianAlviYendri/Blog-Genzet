"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import axios from "axios";
import AdminSidebar from "@/Components/SideBar";
import CategoryForm from "@/Components/Category";

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
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, redirecting to login");
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

      console.log("🚀 ~ fetchProfile ~ data:", data);
      setProfile(data);

      // Check if user is admin
      if (data.role !== "Admin") {
        router.push("/user");
        return;
      }
    } catch (error: any) {
      console.log("🚀 ~ fetchProfile ~ error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      }
    }
  }

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      console.log("🚀 ~ Creating category:", data);

      const response = await axios.post(
        "https://test-fe.mysellerpintar.com/api/categories",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🚀 ~ Category created successfully:", response.data);

      // Show success message (you can add a toast notification here)
      alert("Category created successfully!");

      // Redirect to categories list
      router.push("/admin/categories");
    } catch (error: any) {
      console.log("🚀 ~ handleCreateCategory ~ error:", error);
      throw error; // Re-throw to let the form handle the error
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <AdminSidebar
        profile={profile}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu="categories"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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
                Create Category
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add New Category
              </h2>
              <p className="text-gray-600">
                Create a new category to help organize your articles and improve
                content discovery.
              </p>
            </div>

            {/* Category Form */}
            <CategoryForm
              mode="create"
              onSubmit={handleCreateCategory}
              isLoading={isLoading}
            />

            {/* Guidelines */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-900 mb-3">
                Category Guidelines
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
                  Use clear, descriptive names that are easy to understand
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
                  Keep category names between 2-50 characters
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
                  Avoid creating duplicate or very similar categories
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
                  Use title case for better readability (e.g., "Web
                  Development")
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
