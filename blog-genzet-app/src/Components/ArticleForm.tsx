"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Edit3, Plus, Eye, X } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .min(50, "Content must be at least 50 characters")
    .max(10000, "Content must be less than 10,000 characters"),
  categoryId: z.string().min(1, "Please select a category"),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface Category {
  id: string;
  name: string;
}

interface ArticleFormProps {
  mode: "create" | "edit";
  initialValues?: {
    title?: string;
    content?: string;
    categoryId?: string;
  };
  categories: Category[];
  onSubmit: (data: ArticleFormData) => Promise<void>;
  isLoading: boolean;
}

export default function ArticleForm({
  mode,
  initialValues = {},
  categories,
  onSubmit,
  isLoading,
}: ArticleFormProps) {
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialValues.title || "",
      content: initialValues.content || "",
      categoryId: initialValues.categoryId || "",
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: ArticleFormData) => {
    try {
      clearErrors();
      await onSubmit(data);
    } catch (error: unknown) {
      console.log("🚀 ~ Form submit error:", error);

      // ✅ Proper error handling with type checking
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setError("root", {
            type: "manual",
            message: "Invalid article data. Please check your input.",
          });
        } else if (error.response?.status === 404) {
          setError("categoryId", {
            type: "manual",
            message: "Selected category not found",
          });
        } else {
          setError("root", {
            type: "manual",
            message: `Failed to ${mode} article. Please try again.`,
          });
        }
      } else {
        setError("root", {
          type: "manual",
          message: `Failed to ${mode} article. Please try again.`,
        });
      }
    }
  };

  const formatPreviewContent = (content: string) => {
    return content.replace(/\n/g, "<br />");
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  if (showPreview) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Article Preview
                </h2>
                <p className="text-sm text-gray-600">
                  Review your article before publishing
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Back to Edit
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          {/* Category Badge */}
          {watchedValues.categoryId && (
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {getCategoryName(watchedValues.categoryId)}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {watchedValues.title || "Untitled Article"}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-800 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: formatPreviewContent(
                  watchedValues.content || "No content yet..."
                ),
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-8 border-t">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Back to Edit
            </button>
            <button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting || isLoading}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === "create" ? "Publishing..." : "Updating..."}
                </div>
              ) : (
                <>
                  {mode === "create" ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <Edit3 className="w-4 h-4 mr-2" />
                  )}
                  {mode === "create" ? "Publish Article" : "Update Article"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            {mode === "create" ? (
              <Plus className="w-5 h-5 text-blue-600" />
            ) : (
              <Edit3 className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "create" ? "Create New Article" : "Edit Article"}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === "create"
                ? "Write and publish your article"
                : "Update your article content"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Title Field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Article Title *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="title"
              {...register("title")}
              type="text"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                errors.title
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter your article title (e.g., 'How to Build Amazing Web Applications')"
            />
          </div>
          {errors.title && (
            <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Create an engaging title that clearly describes your article (5-200
            characters)
          </p>
        </div>

        {/* Category Field */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category *
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 ${
              errors.categoryId
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-2 text-sm text-red-600">
              {errors.categoryId.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Choose the most relevant category for your article
          </p>
        </div>

        {/* Content Field */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Article Content *
          </label>
          <textarea
            id="content"
            {...register("content")}
            rows={12}
            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 resize-y ${
              errors.content
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Write your article content here... 

You can write multiple paragraphs, and they will be formatted properly in the preview.

Tips for great content:
• Use clear and engaging language
• Break content into readable paragraphs
• Include relevant examples or details
• Keep your audience in mind"
          />
          {errors.content && (
            <p className="mt-2 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Write comprehensive content that provides value to your readers
            (50-10,000 characters)
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={
              !watchedValues.title?.trim() || !watchedValues.content?.trim()
            }
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Article
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "create" ? "Publishing..." : "Updating..."}
              </div>
            ) : (
              <>
                {mode === "create" ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                {mode === "create" ? "Publish Article" : "Update Article"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
