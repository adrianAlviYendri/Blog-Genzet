"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Newspaper,
  User,
  Eye,
  Search,
  LogOut,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: string;
  username: string;
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
  category: Category;
  user: UserData;
}

interface ArticleResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

interface CategoryResponse {
  data: Category[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserArticlesPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    } catch (error: any) {
      console.log("🚀 ~ fetchProfile ~ error:", error);

      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      }
    }
  }

  async function fetchArticle(page = 1) {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      if (debouncedSearchTerm.trim()) {
        params.append("title", debouncedSearchTerm.trim());
      }

      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }

      console.log(
        "🚀 ~ API URL:",
        `https://test-fe.mysellerpintar.com/api/articles?${params.toString()}`
      );

      const { data } = await axios.get(
        `https://test-fe.mysellerpintar.com/api/articles?${params.toString()}`
      );

      setArticles(data.data);
      setTotalPage(Math.ceil(data.total / 9));
      setCurrentPage(data.page);
      setTotalArticles(data.total);
    } catch (error) {
      console.log("🚀 ~ fetchArticle ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await axios.get<CategoryResponse>(
        "https://test-fe.mysellerpintar.com/api/categories"
      );
      setCategories(data.data);
      console.log("🚀 ~ fetchCategories ~ data:", data.data);
    } catch (error) {
      console.log("🚀 ~ fetchCategories ~ error:", error);
    }
  }

  useEffect(() => {
    fetchProfile();
    fetchArticle(1);
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticle(1);
  }, [debouncedSearchTerm, selectedCategory, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const isValidImageUrl = (url: string | null): url is string => {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      return (
        (urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
        !url.startsWith("blob:")
      );
    } catch {
      return false;
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    console.log("Image failed to load:", e.currentTarget.src);
    e.currentTarget.style.display = "none";
  };

  const handleArticleClick = (articleId: string) => {
    console.log("🚀 ~ Navigating to article:", articleId);
    router.push(`/user/${articleId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Profile */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <Newspaper className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">
                  Blog Genzet
                </span>
              </div>
            </div>

            {/* Profile Dropdown */}
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
                    <div className="text-sm font-medium">
                      {profile?.username || "Loading..."}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile?.role || ""}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {profile?.username}
                    </div>
                    <div className="text-xs text-gray-500">{profile?.role}</div>
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
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <div
        className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.85), rgba(29, 78, 216, 0.85)), url('https://i.pinimg.com/736x/56/51/34/5651343b2dcda1e5fc903bd1764650b6.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          <div className="mb-4 sm:mb-6">
            <span className="inline-block bg-blue-500 bg-opacity-50 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-4">
              Welcome, {profile?.username || "User"}!
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
            The Journal : Design Resources, Interviews, and Industry News
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Your daily dose of design insights!
          </p>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Category Filter */}
              <div className="relative w-full lg:w-1/3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm sm:text-base"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="relative w-full lg:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:px-4 sm:py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm sm:text-base"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="relative w-full lg:w-1/3">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm sm:text-base"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="updatedAt-desc">Recently Updated</option>
                  <option value="updatedAt-asc">Least Recently Updated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Article Count and Sort Info */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                {!isLoading && totalArticles > 0 && (
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                      Showing: {articles.length} of {totalArticles} articles
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <span>Sorted by:</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {sortBy === "createdAt" &&
                          sortOrder === "desc" &&
                          "Newest First"}
                        {sortBy === "createdAt" &&
                          sortOrder === "asc" &&
                          "Oldest First"}
                        {sortBy === "title" &&
                          sortOrder === "asc" &&
                          "Title A-Z"}
                        {sortBy === "title" &&
                          sortOrder === "desc" &&
                          "Title Z-A"}
                        {sortBy === "updatedAt" &&
                          sortOrder === "desc" &&
                          "Recently Updated"}
                        {sortBy === "updatedAt" &&
                          sortOrder === "asc" &&
                          "Least Recently Updated"}
                      </span>
                    </div>
                    {(debouncedSearchTerm || selectedCategory) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <span>Filtered by:</span>
                        {debouncedSearchTerm && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Search: "{debouncedSearchTerm}"
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Category:{" "}
                            {
                              categories.find(
                                (cat) => cat.id === selectedCategory
                              )?.name
                            }
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] hover:bg-white group"
                >
                  <div className="h-40 sm:h-48 overflow-hidden relative">
                    {isValidImageUrl(article.imageUrl) ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-colors duration-200">
                        <Newspaper className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>

                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      Read
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="text-xs sm:text-sm text-gray-500 mb-2 group-hover:text-gray-600 transition-colors duration-200">
                      {formatDate(article.createdAt)}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                      {truncateText(stripHtml(article.content), 100)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                        {article.category?.name || "Category Not Found"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{article.user.username}</span>
                      </div>

                      <div className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Read more →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && articles.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Newspaper className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {debouncedSearchTerm || selectedCategory
                  ? "No Articles Found"
                  : "No Articles Yet"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                {debouncedSearchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria."
                  : "Start exploring articles to find interesting content!"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPage > 1 && !isLoading && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-10">
              <button
                onClick={() => fetchArticle(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium"
              >
                Previous
              </button>
              <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium px-4 py-2">
                Page {currentPage} of {totalPage}
              </span>
              <button
                onClick={() => fetchArticle(currentPage + 1)}
                disabled={currentPage === totalPage}
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
