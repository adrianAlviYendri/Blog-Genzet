"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchProfile();
    if (id) {
      fetchCategory(id as string);
    }
  }, [id]);

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

  async function fetchCategory(categoryId: string) {
    try {
      setIsFetching(true);
      const token = localStorage.getItem("token");

      console.log("🚀 ~ Fetching category:", categoryId);

      const { data } = await axios.get<Category>(
        `https://test-fe.mysellerpintar.com/api/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🚀 ~ Category fetched:", data);
      setCategory(data);
    } catch (error: any) {
      console.log("🚀 ~ fetchCategory ~ error:", error);

      if (error.response?.status === 404) {
        alert("Category not found");
        router.push("/admin/categories");
      } else if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      }
    } finally {
      setIsFetching(false);
    }
  }

  const handleUpdateCategory = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      console.log("🚀 ~ Updating category:", data);

      const response = await axios.put(
        `https://test-fe.mysellerpintar.com/api/categories/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🚀 ~ Category updated successfully:", response.data);

      // Show success message (you can add a toast notification here)
      alert("Category updated successfully!");

      // Redirect to categories list
      router.push("/admin/categories");
    } catch (error: any) {
      console.log("🚀 ~ handleUpdateCategory ~ error:", error);
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

  // Loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          profile={profile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeMenu="categories"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          profile={profile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeMenu="categories"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Tag className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Category Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The category you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={handleBackToCategories}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Category ID:</span>
                <span className="ml-2 font-mono">{category.id}</span>
              </div>
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
            </div>

            {/* Category Form */}
            <CategoryForm
              mode="edit"
              initialValue={category.name}
              onSubmit={handleUpdateCategory}
              isLoading={isLoading}
            />

            {/* Warning */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-yellow-900 mb-3">
                ⚠️ Important Notice
              </h3>
              <p className="text-sm text-yellow-800">
                Changing the category name will update it across all articles
                that use this category. Make sure the new name accurately
                represents the content of associated articles.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
