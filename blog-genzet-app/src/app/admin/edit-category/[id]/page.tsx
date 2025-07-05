"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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

interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }
  const token = getCookie("token");

  useEffect(() => {
    fetchProfile();
    loadCategoryFromParams();
  }, []);

  const loadCategoryFromParams = () => {
    try {
      const categoryData = {
        id: searchParams.get("id") || (id as string),
        name: searchParams.get("name") || "",
        userId: searchParams.get("userId") || "",
        createdAt: searchParams.get("createdAt") || "",
        updatedAt: searchParams.get("updatedAt") || "",
      };

      if (categoryData.id && categoryData.name) {
        setCategory(categoryData);
        console.log("🚀 ~ Category loaded from params:", categoryData);
      } else {
        console.error("Missing required category data in URL params");

        router.push("/admin/categories");
      }
    } catch (error) {
      console.error("🚀 ~ Error loading category from params:", error);
      router.push("/admin/categories");
    }
  };

  async function fetchProfile() {
    try {
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

      if (data.role !== "Admin") {
        router.push("/user");
        return;
      }
    } catch (error: any) {
      console.log("🚀 ~ fetchProfile ~ error:", error);

      if (error.response?.status === 401) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
      }
    }
  }

  const handleUpdateCategory = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);

      const response = await axios.put(
        `https://test-fe.mysellerpintar.com/api/categories/${category?.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🚀 ~ Category updated successfully:", response.data);

      router.push("/admin/categories");
    } catch (error: any) {
      console.log("🚀 ~ handleUpdateCategory ~ error:", error);
      throw error;
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBackToCategories = () => {
    router.push("/admin/categories");
  };

  if (!category) {
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
            <p className="text-gray-600 text-lg">Loading category...</p>
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
                Edit Category
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
                Edit Category
              </h2>
              <p className="text-gray-600">
                Update the category information. This will affect all articles
                using this category.
              </p>
            </div>

            {/* Category Info */}
            <div className="mb-6 bg-gray-100 rounded-lg p-4">
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <span className="font-medium">Created:</span>
                <span className="ml-2">
                  {new Date(category.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2">
                  {new Date(category.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Category Form */}
            <CategoryForm
              mode="edit"
              initialValue={category.name}
              onSubmit={handleUpdateCategory}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
