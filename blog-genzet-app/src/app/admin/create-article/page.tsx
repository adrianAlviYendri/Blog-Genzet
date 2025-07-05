"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminSidebar from "@/Components/SideBar";
import ArticleForm from "@/Components/ArticleForm";

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface CategoryResponse {
  data: Category[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

interface ArticleFormData {
  title: string;
  content: string;
  categoryId: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }
  const token = getCookie("token");

  const fetchProfile = async () => {
    try {
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

      setProfile(data);

      if (data.role !== "Admin") {
        router.push("/user");
        return;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get<CategoryResponse>(
        "https://test-fe.mysellerpintar.com/api/categories?limit=1000"
      );
      setCategories(data.data);
    } catch (error) {}
  };

  const handleCreateArticle = async (data: ArticleFormData) => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        "https://test-fe.mysellerpintar.com/api/articles",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await Swal.fire({
        title: "Success!",
        text: `Article "${data.title}" has been created successfully!`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Back to Articles",
        cancelButtonText: "Create Another",
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#6B7280",
        reverseButtons: true,
        customClass: {
          popup: "rounded-lg",
          title: "text-gray-900 font-bold",
          htmlContainer: "text-gray-600",
          confirmButton: "font-semibold",
          cancelButton: "font-semibold",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/admin");
        }
      });
    } catch (error: any) {
      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to create article. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
        customClass: {
          popup: "rounded-lg",
          title: "text-gray-900 font-bold",
          htmlContainer: "text-gray-600",
          confirmButton: "font-semibold",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBackToArticles = () => {
    router.push("/admin");
  };

  const initializeAllData = async () => {
    await Promise.all([fetchProfile(), fetchCategories()]);
  };

  useEffect(() => {
    initializeAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu="articles"
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToArticles}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Articles</span>
            </button>
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Create Article
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create New Article
              </h2>
              <p className="text-gray-600">
                Write and publish your article to share knowledge with your
                readers.
              </p>
            </div>

            <ArticleForm
              mode="create"
              categories={categories}
              onSubmit={handleCreateArticle}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
