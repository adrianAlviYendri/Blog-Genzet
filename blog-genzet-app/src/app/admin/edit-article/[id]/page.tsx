"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import axios from "axios";
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

interface Article {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    role: string;
    password: string;
    createdAt: string;
    updatedAt: string;
  };
  category: {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface ArticleFormData {
  title: string;
  content: string;
  categoryId: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }
  const token = getCookie("token");

  const loadArticleFromParams = (): Article | null => {
    try {
      const title = searchParams.get("title");
      const content = searchParams.get("content");
      const categoryId = searchParams.get("categoryId");
      const categoryName = searchParams.get("categoryName");
      const userId = searchParams.get("userId");
      const username = searchParams.get("username");
      const userRole = searchParams.get("userRole");
      const imageUrl = searchParams.get("imageUrl");
      const createdAt = searchParams.get("createdAt");
      const updatedAt = searchParams.get("updatedAt");
      const categoryUserId = searchParams.get("categoryUserId");
      const categoryCreatedAt = searchParams.get("categoryCreatedAt");
      const categoryUpdatedAt = searchParams.get("categoryUpdatedAt");

      if (title && content && categoryId) {
        return {
          id: id as string,
          userId: userId || "",
          categoryId,
          title,
          content,
          imageUrl,
          createdAt: createdAt || "",
          updatedAt: updatedAt || "",
          user: {
            id: userId || "",
            username: username || "Unknown User",
            role: userRole || "User",
            password: "",
            createdAt: createdAt || "",
            updatedAt: updatedAt || "",
          },
          category: {
            id: categoryId,
            userId: categoryUserId || "",
            name: categoryName || "Unknown Category",
            createdAt: categoryCreatedAt || "",
            updatedAt: categoryUpdatedAt || "",
          },
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchArticleFromAPI = async () => {
    try {
      const { data } = await axios.get<Article>(
        `https://test-fe.mysellerpintar.com/api/articles/${id}`
      );

      setArticle(data);
    } catch (error: any) {
      throw error;
    }
  };

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
    } catch (error) {
      console.log("🚀 ~ fetchCategories ~ error:", error);
    }
  };

  const loadArticleData = async () => {
    try {
      setIsInitialLoading(true);

      const articleFromParams = loadArticleFromParams();

      if (articleFromParams) {
        setArticle(articleFromParams);
      } else {
        await fetchArticleFromAPI();
      }
    } catch (error) {
      alert("Error loading article data. Redirecting to articles list.");
      router.push("/admin");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const initializeData = async () => {
    await Promise.all([fetchProfile(), fetchCategories(), loadArticleData()]);
  };

  const handleUpdateArticle = async (data: ArticleFormData) => {
    try {
      setIsLoading(true);

      const response = await axios.put(
        `https://test-fe.mysellerpintar.com/api/articles/${article?.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      router.push("/admin");
    } catch (error: any) {
      throw error;
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

  useEffect(() => {
    initializeData();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeMenu="articles"
        />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeMenu="articles"
        />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Article Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The article you're trying to edit doesn't exist or you don't have
              permission to edit it.
            </p>
            <button
              onClick={handleBackToArticles}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Articles
            </button>
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
                Edit Article
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Edit Article
              </h2>
              <p className="text-gray-600">
                Update your article content and settings.
              </p>
            </div>

            <div className="mb-6 bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium">Article ID:</span>
                  <span className="ml-2 font-mono">{article.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Author:</span>
                  <span className="ml-2">{article.user.username}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{article.category.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Author Role:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {article.user.role}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">
                    {new Date(article.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <ArticleForm
              mode="edit"
              initialValues={{
                title: article.title,
                content: article.content,
                categoryId: article.categoryId,
              }}
              categories={categories}
              onSubmit={handleUpdateArticle}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
