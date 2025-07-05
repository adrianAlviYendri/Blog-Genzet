"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, Search } from "lucide-react";
import UserNavbar from "@/Components/UserNavBar";
import ArticleCard from "@/Components/ArticleCard";

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

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserArticlesClientProps {
  initialProfile: ProfileResponse;
  initialArticles: Article[];
  initialCategories: Category[];
}

export default function UserArticlesClient({
  initialProfile,
  initialArticles,
  initialCategories,
}: UserArticlesClientProps) {
  const router = useRouter();

  const [allArticles] = useState<Article[]>(initialArticles);
  const [filteredArticles, setFilteredArticles] =
    useState<Article[]>(initialArticles);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [categories] = useState<Category[]>(initialCategories);
  const [profile] = useState<ProfileResponse>(initialProfile);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles] = useState(initialArticles.length);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const limit = 9;

  const filterAndSortArticles = useCallback(
    (
      articles: Article[],
      searchTerm: string,
      categoryId: string,
      sortBy: string,
      sortOrder: "asc" | "desc"
    ) => {
      let filtered = [...articles];

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

      if (categoryId) {
        filtered = filtered.filter(
          (article) => article.categoryId === categoryId
        );
      }

      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "updatedAt":
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
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
    },
    []
  );

  const paginateArticles = useCallback(
    (articles: Article[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return articles.slice(startIndex, endIndex);
    },
    []
  );

  const handleArticleClick = (articleId: string) => {
    router.push(`/user/${articleId}`);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedCategory("");
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const filtered = filterAndSortArticles(
      allArticles,
      debouncedSearchTerm,
      selectedCategory,
      sortBy,
      sortOrder
    );

    setFilteredArticles(filtered);
    setCurrentPage(1);

    const totalPagesCalculated = Math.ceil(filtered.length / limit);
    setTotalPages(totalPagesCalculated);
  }, [
    allArticles,
    debouncedSearchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
    filterAndSortArticles,
    limit,
  ]);

  useEffect(() => {
    const paginated = paginateArticles(filteredArticles, currentPage, limit);
    setDisplayedArticles(paginated);
  }, [filteredArticles, currentPage, limit, paginateArticles]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar
        profile={profile}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
      />

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

          <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
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

            {(debouncedSearchTerm || selectedCategory) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-white/80">Active filters:</span>
                {debouncedSearchTerm && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm">
                    Search: "{debouncedSearchTerm}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm">
                    Category: {getCategoryName(selectedCategory)}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-white/80 hover:text-white underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                    {debouncedSearchTerm || selectedCategory ? (
                      <>
                        Showing {displayedArticles.length} of{" "}
                        {filteredArticles.length} filtered results (Total:{" "}
                        {totalArticles} articles)
                      </>
                    ) : (
                      <>
                        Showing {displayedArticles.length} of {totalArticles}{" "}
                        articles
                      </>
                    )}
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
                      {sortBy === "title" && sortOrder === "asc" && "Title A-Z"}
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
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onArticleClick={handleArticleClick}
              />
            ))}
          </div>

          {displayedArticles.length === 0 && (
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
                  ? "No articles match your current filters. Try adjusting your search criteria."
                  : "Start exploring articles to find interesting content!"}
              </p>
              {(debouncedSearchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium"
              >
                Previous
              </button>
              <span className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
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
