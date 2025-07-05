"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, Plus, Edit3 } from "lucide-react";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_&]+$/,
      "Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands"
    ),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  mode: "create" | "edit";
  initialValue?: string;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading: boolean;
}

export default function CategoryForm({
  mode,
  initialValue = "",
  onSubmit,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialValue,
    },
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      clearErrors();
      await onSubmit(data);
    } catch (error: any) {
      console.log("🚀 ~ Form submit error:", error);

      if (error.response?.status === 409) {
        setError("name", {
          type: "manual",
          message: "Category name already exists",
        });
      } else if (error.response?.status === 400) {
        setError("root", {
          type: "manual",
          message: "Invalid category data",
        });
      } else {
        setError("root", {
          type: "manual",
          message: `Failed to ${mode} category. Please try again.`,
        });
      }
    }
  };

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
              {mode === "create" ? "Create New Category" : "Edit Category"}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === "create"
                ? "Add a new category to organize your articles"
                : "Update the category information"}
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

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              {...register("name")}
              type="text"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                errors.name
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter category name (e.g., Technology, Health, Sports)"
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use descriptive names that help organize your content effectively
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "create" ? "Creating..." : "Updating..."}
              </div>
            ) : (
              <>
                {mode === "create" ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                {mode === "create" ? "Create Category" : "Update Category"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
