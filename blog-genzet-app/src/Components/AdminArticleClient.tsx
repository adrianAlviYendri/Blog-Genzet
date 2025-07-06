"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "@/Components/SideBar";
import AdminNavbar from "@/Components/AdminNavBar";
import ArticlesTable from "@/Components/ArticleTable";

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

interface AdminArticlesClientProps {
  initialArticles: Article[];
  initialCategories: Category[];
}

export default function AdminArticlesClient({
  initialArticles,
  initialCategories,
}: AdminArticlesClientProps) {
  const router = useRouter();

  const [allArticles] = useState<Article[]>(initialArticles);
  const [filteredArticles, setFilteredArticles] =
    useState<Article[]>(initialArticles);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [categories] = useState<Category[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles] = useState(initialArticles.length);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const applyFiltersAndPagination = useCallback(() => {
    let filtered = [...allArticles];

    if (debouncedSearchTerm.trim()) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase().trim();
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

    if (selectedCategory) {
      filtered = filtered.filter(
        (article) => article.categoryId === selectedCategory
      );
    }

    filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    setFilteredArticles(filtered);

    const totalPagesCalculated = Math.ceil(filtered.length / limit);
    setTotalPages(totalPagesCalculated);

    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const displayedData = filtered.slice(startIndex, endIndex);
    setDisplayedArticles(displayedData);
  }, [allArticles, debouncedSearchTerm, selectedCategory, currentPage, limit]);

  const getCurrentPageInfo = () => {
    const start = Math.min(
      (currentPage - 1) * limit + 1,
      filteredArticles.length
    );
    const end = Math.min(currentPage * limit, filteredArticles.length);
    return { start, end };
  };

  const getFilteredTotal = () => {
    return filteredArticles.length;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/edit-article/${articleId}`);
  };

  const handleCreateArticle = () => {
    router.push("/admin/create-article");
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

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [applyFiltersAndPagination]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu="articles"
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminNavbar
          isDropdownOpen={isDropdownOpen}
          toggleDropdown={toggleDropdown}
          toggleSidebar={toggleSidebar}
          title="Articles"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <p className="text-gray-700 font-medium">
                Total Articles:{" "}
                <span className="font-bold text-gray-900">{totalArticles}</span>
                {(debouncedSearchTerm || selectedCategory) && (
                  <span className="ml-2 text-blue-700 font-semibold">
                    (Showing {getFilteredTotal()} filtered results)
                  </span>
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full lg:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by title, content, category, or author..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium placeholder-gray-500"
                  />
                  {searchTerm !== debouncedSearchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {(debouncedSearchTerm || selectedCategory) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm text-gray-700 font-semibold">
                    Active filters:
                  </span>
                  {debouncedSearchTerm && (
                    <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm font-semibold">
                      Search: &ldquo;{debouncedSearchTerm}&rdquo;
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="bg-green-100 text-green-900 px-2 py-1 rounded-full text-sm font-semibold">
                      Category: {getCategoryName(selectedCategory)}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-700 hover:text-gray-900 underline font-semibold"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCreateArticle}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Articles List
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
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <ArticlesTable
                articles={displayedArticles}
                isLoading={false}
                searchTerm={debouncedSearchTerm}
                onEditArticle={handleEditArticle}
                onCreateArticle={handleCreateArticle}
                onClearFilters={clearFilters}
                hasFilters={!!(debouncedSearchTerm || selectedCategory)}
              />
            </div>

            {totalPages > 1 && (
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
