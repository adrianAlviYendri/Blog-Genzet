"use client";

import { Newspaper, User, Eye } from "lucide-react";
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

interface ArticleCardProps {
  article: Article;
  onArticleClick: (articleId: string) => void;
}

export default function ArticleCard({
  article,
  onArticleClick,
}: ArticleCardProps) {
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

  return (
    <div
      onClick={() => onArticleClick(article.id)}
      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] hover:bg-white group"
    >
      {/* Article Image */}
      <div className="h-40 sm:h-48 overflow-hidden relative">
        {isValidImageUrl(article.imageUrl) ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-colors duration-200">
            <Newspaper className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>

        {/* Read Button */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
          <Eye className="w-3 h-3 mr-1" />
          Read
        </div>
      </div>

      {/* Article Content */}
      <div className="p-4 sm:p-6">
        {/* Date */}
        <div className="text-xs sm:text-sm text-gray-500 mb-2 group-hover:text-gray-600 transition-colors duration-200">
          {formatDate(article.createdAt)}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {article.title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
          {truncateText(stripHtml(article.content), 100)}
        </p>

        {/* Category Badge */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
            {article.category?.name || "Category Not Found"}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>{article.user.username}</span>
          </div>

          {/* Read More */}
          <div className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Read more →
          </div>
        </div>
      </div>
    </div>
  );
}
