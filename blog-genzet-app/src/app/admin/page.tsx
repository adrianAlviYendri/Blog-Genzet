"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Search,
  LogOut,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import axios from "axios";
import AdminSidebar from "@/Components/SideBar";

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
  role: string;
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

export default function AdminArticlesPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Raw data dari API
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  // Data yang sudah difilter
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  // Data yang ditampilkan setelah pagination
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // ========== API FUNCTIONS ==========
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

  async function fetchAllArticles() {
    try {
      setIsLoading(true);

      console.log("🚀 ~ Fetching all articles from API");

      // Ambil semua data tanpa pagination dan filter untuk client-side processing
      const { data } = await axios.get<ArticleResponse>(
        "https://test-fe.mysellerpintar.com/api/articles?limit=1000"
      );

      console.log("🚀 ~ fetchAllArticles ~ data:", data);

      setAllArticles(data.data);
      setTotalArticles(data.data.length);
    } catch (error) {
      console.log("🚀 ~ fetchAllArticles ~ error:", error);
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

  // ========== CLIENT-SIDE FILTERING, SORTING & PAGINATION ==========
  const filterAndSortArticles = (
    articles: Article[],
    searchTerm: string,
    categoryId: string,
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) => {
    let filtered = [...articles];

    // Filter by search term (search in title and content)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((article) => {
        const matchesTitle = article.title
          .toLowerCase()
          .includes(lowerSearchTerm);
        const matchesContent = article.content
          .toLowerCase()
          .includes(lowerSearchTerm);
        const matchesCategory = article.category?.name
          .toLowerCase()
          .includes(lowerSearchTerm);
        const matchesAuthor = article.user?.username
          .toLowerCase()
          .includes(lowerSearchTerm);

        return (
          matchesTitle || matchesContent || matchesCategory || matchesAuthor
        );
      });
    }

    // Filter by category
    if (categoryId) {
      filtered = filtered.filter(
        (article) => article.categoryId === categoryId
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "category":
          aValue = a.category?.name.toLowerCase() || "";
          bValue = b.category?.name.toLowerCase() || "";
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const paginateArticles = (
    articles: Article[],
    page: number,
    limit: number
  ) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return articles.slice(startIndex, endIndex);
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchProfile();
    fetchAllArticles();
    fetchCategories();
  }, []);

  // Filter and sort articles when dependencies change
  useEffect(() => {
    const filtered = filterAndSortArticles(
      allArticles,
      debouncedSearchTerm,
      selectedCategory,
      sortBy,
      sortOrder
    );

    setFilteredArticles(filtered);

    // Reset to page 1 when filters change
    setCurrentPage(1);

    // Calculate total pages
    const totalPagesCalculated = Math.ceil(filtered.length / limit);
    setTotalPages(totalPagesCalculated);

    console.log("🚀 ~ Filter and sort applied:", {
      searchTerm: debouncedSearchTerm,
      categoryId: selectedCategory,
      sortBy,
      sortOrder,
      totalResults: filtered.length,
      totalPages: totalPagesCalculated,
    });
  }, [
    allArticles,
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
    limit,
  ]);

  // Paginate filtered articles when page or limit changes
  useEffect(() => {
    const paginated = paginateArticles(filteredArticles, currentPage, limit);
    setDisplayedArticles(paginated);

    console.log("🚀 ~ Pagination applied:", {
      currentPage,
      limit,
      displayedCount: paginated.length,
    });
  }, [filteredArticles, currentPage, limit]);

  // ========== HELPER FUNCTIONS ==========
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-800 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getFilteredTotal = () => {
    return filteredArticles.length;
  };

  const getCurrentPageInfo = () => {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, filteredArticles.length);
    return { start, end };
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  // ========== HANDLER FUNCTIONS ==========
  const handleViewArticle = (articleId: string) => {
    router.push(`/admin/articles/${articleId}`);
  };

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/articles/${articleId}/edit`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://test-fe.mysellerpintar.com/api/articles/${articleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh data setelah delete
        fetchAllArticles();
      } catch (error) {
        console.log("🚀 ~ handleDeleteArticle ~ error:", error);
        alert("Failed to delete article.");
      }
    }
  };

  const handleCreateArticle = () => {
    router.push("/admin/articles/create");
  };

  const handleCategoryManagement = () => {
    router.push("/admin/categories");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <AdminSidebar
        profile={profile}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu="articles"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Articles</h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Info */}
            <div className="mb-6">
              <p className="text-gray-600">
                Total Articles:{" "}
                <span className="font-semibold">{totalArticles}</span>
                {(debouncedSearchTerm || selectedCategory) && (
                  <span className="ml-2 text-blue-600">
                    (Showing {getFilteredTotal()} filtered results)
                  </span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full lg:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative flex-1 lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by title, content, category, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm !== debouncedSearchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Sort Controls */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="category">Sort by Category</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Filter Info */}
              {(debouncedSearchTerm || selectedCategory) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {debouncedSearchTerm && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      Search: "{debouncedSearchTerm}"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      Category: {getCategoryName(selectedCategory)}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCreateArticle}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article
                </button>
                <button
                  onClick={handleCategoryManagement}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Manage Categories
                </button>
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Articles List
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Show:</span>
                    <select
                      value={limit}
                      onChange={(e) =>
                        handleLimitChange(Number(e.target.value))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Table Content */}
              {!isLoading && displayedArticles.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thumbnails
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created at
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedArticles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50">
                          {/* Thumbnail */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              {isValidImageUrl(article.imageUrl) ? (
                                <img
                                  src={article.imageUrl}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title */}
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {highlightSearchTerm(
                                  truncateText(article.title, 50),
                                  debouncedSearchTerm
                                )}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {highlightSearchTerm(
                                  truncateText(stripHtml(article.content), 60),
                                  debouncedSearchTerm
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {highlightSearchTerm(
                                article.category?.name || "No Category",
                                debouncedSearchTerm
                              )}
                            </span>
                          </td>

                          {/* Author */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {highlightSearchTerm(
                                article.user?.username || "Unknown",
                                debouncedSearchTerm
                              )}
                            </div>
                          </td>

                          {/* Created At */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(article.createdAt)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewArticle(article.id)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="View Article"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditArticle(article.id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Edit Article"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete Article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && displayedArticles.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Articles Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {debouncedSearchTerm || selectedCategory
                      ? "No articles match your current filters. Try adjusting your search criteria."
                      : "Get started by creating your first article."}
                  </p>
                  {debouncedSearchTerm || selectedCategory ? (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 mr-2"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                  <button
                    onClick={handleCreateArticle}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {getCurrentPageInfo().start}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {getCurrentPageInfo().end}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{getFilteredTotal()}</span>{" "}
                      {debouncedSearchTerm || selectedCategory
                        ? "filtered "
                        : ""}
                      results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
