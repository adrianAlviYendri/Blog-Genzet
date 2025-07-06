"use client";

import { Calendar, FileText, Edit } from "lucide-react";
import Image from "next/image";

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

interface ArticlesTableProps {
  articles: Article[];
  isLoading: boolean;
  searchTerm: string;
  onEditArticle: (articleId: string) => void;
  onCreateArticle: () => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function ArticlesTable({
  articles,
  isLoading,
  searchTerm,
  onEditArticle,
  onCreateArticle,
  onClearFilters,
  hasFilters,
}: ArticlesTableProps) {
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
    e.currentTarget.style.display = "none";
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-yellow-200 text-yellow-900 font-semibold"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Articles Found
          </h3>
          <p className="text-gray-700 mb-4 font-medium">
            {hasFilters
              ? "No articles match your current filters. Try adjusting your search criteria."
              : "Get started by creating your first article."}
          </p>
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 mr-2 font-semibold"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onCreateArticle}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Article
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Thumbnails
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Created at
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                    {isValidImageUrl(article.imageUrl) ? (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {highlightSearchTerm(
                        truncateText(article.title, 50),
                        searchTerm
                      )}
                    </div>
                    <div className="text-sm text-gray-700 truncate font-medium">
                      {highlightSearchTerm(
                        truncateText(stripHtml(article.content), 60),
                        searchTerm
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-bold bg-blue-100 text-blue-900 rounded-full">
                    {highlightSearchTerm(
                      article.category?.name || "No Category",
                      searchTerm
                    )}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {highlightSearchTerm(
                      article.user?.username || "Unknown",
                      searchTerm
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.createdAt)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditArticle(article.id)}
                      className="text-green-600 hover:text-green-800 p-1 rounded font-semibold"
                      title="Edit Article"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
