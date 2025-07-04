"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

// ========== INTERFACES ==========
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
  password: string;
  createdAt: string;
  updatedAt: string;
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

interface ArticleDetailResponse extends Article {}

interface ArticleListResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

// ========== MAIN COMPONENT ==========
export default function ArticleDetailPage() {
  // ========== STATES ==========
  const { id } = useParams();
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (id) {
      fetchArticleDetail(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (article?.content) {
      const wordsPerMinute = 200;
      const words = stripHtml(article.content).split(/\s+/).length;
      const minutes = Math.ceil(words / wordsPerMinute);
      setReadingTime(minutes);
    }
  }, [article?.content]);

  useEffect(() => {
    if (article?.category?.name) {
      fetchRelatedArticles(article.category.name, article.id);
    }
  }, [article]);

  // ========== API FUNCTIONS ==========
  async function fetchArticleDetail(id: string) {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🚀 ~ Fetching article detail:",
        `https://test-fe.mysellerpintar.com/api/articles/${id}`
      );

      const { data } = await axios.get<ArticleDetailResponse>(
        `https://test-fe.mysellerpintar.com/api/articles/${id}`
      );

      console.log("🚀 ~ Article detail:", data);
      setArticle(data);
    } catch (error) {
      console.log("🚀 ~ fetchArticleDetail ~ error:", error);
      setError("Failed to load article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRelatedArticles(
    categoryName: string,
    currentArticleId: string
  ) {
    try {
      setIsRelatedLoading(true);

      console.log("🚀 ~ Fetching related articles for category:", categoryName);

      const { data } = await axios.get<ArticleListResponse>(
        `https://test-fe.mysellerpintar.com/api/articles?limit=100`
      );

      console.log("🚀 ~ All articles:", data.data);

      // Filter articles by category name and exclude current article
      const filtered = data.data
        .filter(
          (article) =>
            article.category?.name === categoryName &&
            article.id !== currentArticleId
        )
        .slice(0, 3); // Take only 3 articles

      console.log("🚀 ~ Filtered related articles:", filtered);
      setRelatedArticles(filtered);
    } catch (error) {
      console.log("🚀 ~ fetchRelatedArticles ~ error:", error);
    } finally {
      setIsRelatedLoading(false);
    }
  }

  // ========== UTILITY FUNCTIONS ==========
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // ========== EVENT HANDLERS ==========
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    console.log("Image failed to load:", e.currentTarget.src);
    e.currentTarget.style.display = "none";
  };

  const handleRelatedArticleClick = (articleId: string) => {
    router.push(`/user/${articleId}`);
  };

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading article...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Eye className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "The article you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/user")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== HEADER ========== */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/user")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Articles</span>
          </button>
        </div>
      </div>

      {/* ========== ARTICLE CONTENT ========== */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {article.category?.name || "Uncategorized"}
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Article Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-8">
            {/* Author */}
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="font-medium">{article.user.username}</span>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {article.user.role}
              </span>
            </div>

            {/* Publication Date */}
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(article.createdAt)}</span>
            </div>

            {/* Reading Time */}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {isValidImageUrl(article.imageUrl) && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div
            className="text-gray-800 leading-relaxed 
                     prose-headings:text-gray-900 
                     prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 
                     prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 
                     prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed 
                     prose-ul:my-4 prose-ul:ml-6 prose-li:mb-2 
                     prose-ol:my-4 prose-ol:ml-6 
                     prose-strong:font-semibold prose-strong:text-gray-900 
                     prose-img:rounded-lg prose-img:shadow-md prose-img:my-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="text-sm text-gray-600 text-center">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4">
              <span>Published: {formatDateTime(article.createdAt)}</span>
              {article.createdAt !== article.updatedAt && (
                <span>Updated: {formatDateTime(article.updatedAt)}</span>
              )}
            </div>
          </div>
        </footer>
      </article>

      {/* ========== RELATED ARTICLES SECTION ========== */}
      <section className="bg-white border-t py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Other articles from "{article.category?.name}"
          </h2>

          {/* Loading State for Related Articles */}
          {isRelatedLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Related Articles Grid */}
          {!isRelatedLoading && relatedArticles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <div
                  key={relatedArticle.id}
                  onClick={() => handleRelatedArticleClick(relatedArticle.id)}
                  className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Article Image */}
                  <div className="h-48 overflow-hidden">
                    {isValidImageUrl(relatedArticle.imageUrl) ? (
                      <img
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Eye className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Article Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {relatedArticle.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {truncateText(stripHtml(relatedArticle.content), 100)}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{relatedArticle.user.username}</span>
                      </div>
                      <span>{formatDate(relatedArticle.createdAt)}</span>
                    </div>

                    {/* Read More Indicator */}
                    <div className="mt-3 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>Read article</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Related Articles */}
          {!isRelatedLoading && relatedArticles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No other articles found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
