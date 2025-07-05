"use client";

import { Edit, Tag, Calendar, Users, Plus } from "lucide-react";

interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  searchTerm: string;
  onEditCategory: (category: Category) => void;
  onCreateCategory: () => void;
  onClearSearch: () => void;
  hasSearchTerm: boolean;
}

export default function CategoriesTable({
  categories,
  isLoading,
  searchTerm,
  onEditCategory,
  onCreateCategory,
  onClearSearch,
  hasSearchTerm,
}: CategoriesTableProps) {
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

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {hasSearchTerm ? "No Categories Found" : "No Categories Yet"}
          </h3>
          <p className="text-gray-700 mb-4 font-medium">
            {hasSearchTerm
              ? `No categories match "${searchTerm}". Try a different search term.`
              : "Get started by creating your first category."}
          </p>
          {hasSearchTerm && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 mr-2 font-semibold"
            >
              Clear Search
            </button>
          )}
          <button
            onClick={onCreateCategory}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Category
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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Updated At
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">
                        {highlightSearchTerm(category.name, searchTerm)}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        ID:{" "}
                        {highlightSearchTerm(
                          category.id.substring(0, 8) + "...",
                          searchTerm
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-500 mr-2" />
                    <div className="text-sm text-gray-900 font-semibold">
                      {highlightSearchTerm(
                        category.userId.substring(0, 8) + "...",
                        searchTerm
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(category.createdAt)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(category.updatedAt)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditCategory(category)}
                      className="text-green-600 hover:text-green-800 p-1 rounded font-semibold"
                      title="Edit Category"
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
