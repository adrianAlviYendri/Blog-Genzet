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
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  Users,
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

export default function AdminCategoriesPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Raw data dari API
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  // Data yang sudah difilter untuk ditampilkan
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  // Data yang ditampilkan setelah pagination
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    []
  );

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [limit, setLimit] = useState(10);

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

  async function fetchAllCategories() {
    try {
      setIsLoading(true);

      console.log("🚀 ~ Fetching all categories from API");

      // Ambil semua data tanpa pagination untuk client-side filtering
      const { data } = await axios.get<CategoryResponse>(
        "https://test-fe.mysellerpintar.com/api/categories?limit=1000"
      );

      console.log("🚀 ~ fetchAllCategories ~ data:", data);

      setAllCategories(data.data);
      setTotalCategories(data.data.length);
    } catch (error) {
      console.log("🚀 ~ fetchAllCategories ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // ========== CLIENT-SIDE FILTERING & PAGINATION ==========
  const filterCategories = (categories: Category[], searchTerm: string) => {
    if (!searchTerm.trim()) {
      return categories;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return categories.filter((category) => {
      // Search dalam nama category
      const matchesName = category.name.toLowerCase().includes(lowerSearchTerm);

      // Search dalam ID category (untuk advanced search)
      const matchesId = category.id.toLowerCase().includes(lowerSearchTerm);

      // Search dalam userId
      const matchesUserId = category.userId
        .toLowerCase()
        .includes(lowerSearchTerm);

      return matchesName || matchesId || matchesUserId;
    });
  };

  const paginateCategories = (
    categories: Category[],
    page: number,
    limit: number
  ) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return categories.slice(startIndex, endIndex);
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchProfile();
    fetchAllCategories();
  }, []);

  // Filter categories when search term changes
  useEffect(() => {
    const filtered = filterCategories(allCategories, debouncedSearchTerm);
    setFilteredCategories(filtered);

    // Reset to page 1 when search changes
    setCurrentPage(1);

    // Calculate total pages
    const totalPagesCalculated = Math.ceil(filtered.length / limit);
    setTotalPages(totalPagesCalculated);

    console.log("🚀 ~ Filter applied:", {
      searchTerm: debouncedSearchTerm,
      totalResults: filtered.length,
      totalPages: totalPagesCalculated,
    });
  }, [allCategories, debouncedSearchTerm, limit]);

  // Paginate filtered categories when page or limit changes
  useEffect(() => {
    const paginated = paginateCategories(
      filteredCategories,
      currentPage,
      limit
    );
    setDisplayedCategories(paginated);

    console.log("🚀 ~ Pagination applied:", {
      currentPage,
      limit,
      displayedCount: paginated.length,
    });
  }, [filteredCategories, currentPage, limit]);

  // ========== HELPER FUNCTIONS ==========
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    return filteredCategories.length;
  };

  const getCurrentPageInfo = () => {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, filteredCategories.length);
    return { start, end };
  };

  // ========== HANDLER FUNCTIONS ==========
  const handleCreateCategory = () => {
    router.push("/admin/create-category");
  };

  const handleEditCategory = (category: Category) => {
    // Kirim data lengkap melalui query parameters
    const queryParams = new URLSearchParams({
      id: category.id,
      name: category.name,
      userId: category.userId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });

    router.push(
      `/admin/edit-category/${category.id}?${queryParams.toString()}`
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://test-fe.mysellerpintar.com/api/categories/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh data setelah delete
        fetchAllCategories();
      } catch (error) {
        console.log("🚀 ~ handleDeleteCategory ~ error:", error);
        alert("Failed to delete category. It might be used by some articles.");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
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
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
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
                Total Categories:{" "}
                <span className="font-semibold">{totalCategories}</span>
                {debouncedSearchTerm && (
                  <span className="ml-2 text-blue-600">
                    (Showing {getFilteredTotal()} filtered results)
                  </span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1 lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories by name, ID, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm !== debouncedSearchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      title="Clear search"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search Info */}
                {debouncedSearchTerm && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      "{debouncedSearchTerm}" - {getFilteredTotal()} results
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCreateCategory}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </button>
              </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Categories List
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
              {!isLoading && displayedCategories.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Tag className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {highlightSearchTerm(
                                    category.name,
                                    debouncedSearchTerm
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID:{" "}
                                  {highlightSearchTerm(
                                    category.id.substring(0, 8) + "...",
                                    debouncedSearchTerm
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Created By */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">
                                {highlightSearchTerm(
                                  category.userId.substring(0, 8) + "...",
                                  debouncedSearchTerm
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Created At */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(category.createdAt)}
                            </div>
                          </td>

                          {/* Updated At */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(category.updatedAt)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Edit Category"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete Category"
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
              {!isLoading && displayedCategories.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {debouncedSearchTerm
                      ? "No Categories Found"
                      : "No Categories Yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {debouncedSearchTerm
                      ? `No categories match "${debouncedSearchTerm}". Try a different search term.`
                      : "Get started by creating your first category."}
                  </p>
                  {debouncedSearchTerm ? (
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 mr-2"
                    >
                      Clear Search
                    </button>
                  ) : null}
                  <button
                    onClick={handleCreateCategory}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
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
                      {debouncedSearchTerm ? "filtered " : ""}results
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
