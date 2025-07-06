"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import AdminSidebar from "@/Components/SideBar";
import AdminNavbar from "@/Components/AdminNavBar";
import CategoriesTable from "@/Components/CategoryTable";

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

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [limit, setLimit] = useState(10);

  const fetchAllCategories = async () => {
    try {
      setIsLoading(true);

      const { data } = await axios.get<CategoryResponse>(
        "https://test-fe.mysellerpintar.com/api/categories?limit=1000"
      );

      setAllCategories(data.data);
      setTotalCategories(data.data.length);
      setFilteredCategories(data.data);
    } catch (error) {
      console.log("🚀 ~ fetchAllCategories ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndPagination = useCallback(() => {
    let filtered = [...allCategories];

    if (debouncedSearchTerm.trim()) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((category) => {
        const matchesName = category.name
          .toLowerCase()
          .includes(lowerSearchTerm);
        const matchesId = category.id.toLowerCase().includes(lowerSearchTerm);
        const matchesUserId = category.userId
          .toLowerCase()
          .includes(lowerSearchTerm);

        return matchesName || matchesId || matchesUserId;
      });
    }

    filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    setFilteredCategories(filtered);

    const totalPagesCalculated = Math.ceil(filtered.length / limit);
    setTotalPages(totalPagesCalculated);

    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);
    setDisplayedCategories(paginated);
  }, [allCategories, debouncedSearchTerm, currentPage, limit]);

  const initializeData = useCallback(async () => {
    await fetchAllCategories();
  }, []);

  const getFilteredTotal = () => {
    return filteredCategories.length;
  };

  const getCurrentPageInfo = () => {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, filteredCategories.length);
    return { start, end };
  };

  const handleCreateCategory = () => {
    router.push("/admin/create-category");
  };

  const handleEditCategory = (category: Category) => {
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (allCategories.length > 0) {
      applyFiltersAndPagination();
    }
  }, [applyFiltersAndPagination, allCategories.length]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu="categories"
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminNavbar
          isDropdownOpen={isDropdownOpen}
          toggleDropdown={toggleDropdown}
          toggleSidebar={toggleSidebar}
          title="Categories"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <p className="text-gray-700 font-semibold">
                Total Categories:{" "}
                <span className="font-bold text-gray-900">
                  {totalCategories}
                </span>
                {debouncedSearchTerm && (
                  <span className="ml-2 text-blue-700 font-bold">
                    (Showing {getFilteredTotal()} filtered results)
                  </span>
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="relative flex-1 lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories by name, ID, or user..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500"
                  />
                  {searchTerm !== debouncedSearchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {debouncedSearchTerm && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full font-semibold">
                      &ldquo;{debouncedSearchTerm}&rdquo; - {getFilteredTotal()}{" "}
                      results
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCreateCategory}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Categories List
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 font-semibold">
                      Show:
                    </span>
                    <select
                      value={limit}
                      onChange={(e) =>
                        handleLimitChange(Number(e.target.value))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <CategoriesTable
                categories={displayedCategories}
                isLoading={isLoading}
                searchTerm={debouncedSearchTerm}
                onEditCategory={handleEditCategory}
                onCreateCategory={handleCreateCategory}
                onClearSearch={clearSearch}
                hasSearchTerm={!!debouncedSearchTerm}
              />
            </div>

            {totalPages > 1 && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-800 font-semibold">
                      Showing{" "}
                      <span className="font-bold text-gray-900">
                        {getCurrentPageInfo().start}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-gray-900">
                        {getCurrentPageInfo().end}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-gray-900">
                        {getFilteredTotal()}
                      </span>{" "}
                      {debouncedSearchTerm ? "filtered " : ""}results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-800 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
