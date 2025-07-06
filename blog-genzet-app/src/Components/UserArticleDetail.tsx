"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";

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

interface ArticleDetailClientProps {
  initialArticle: Article;
  initialRelatedArticles: Article[];
}

export default function ArticleDetailClient({
  initialArticle,
  initialRelatedArticles,
}: ArticleDetailClientProps) {
  const router = useRouter();
  const [article] = useState<Article>(initialArticle);
  const [relatedArticles] = useState<Article[]>(initialRelatedArticles);

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = stripHtml(content).split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const handleRelatedArticleClick = (articleId: string) => {
    router.push(`/user/${articleId}`);
  };

  const readingTime = calculateReadingTime(article.content);

  return (
    <div className="min-h-screen bg-gray-50">
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

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {article.category?.name || "Uncategorized"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="font-medium">{article.user.username}</span>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {article.user.role}
              </span>
            </div>

            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(article.createdAt)}</span>
            </div>

            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {isValidImageUrl(article.imageUrl) && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

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

        <footer className="border-t border-gray-200 pt-8">
          <div className="text-sm text-gray-600 text-center">
            <p>
              Published on {formatDate(article.createdAt)} by{" "}
              <span className="font-medium">{article.user.username}</span>
            </p>
            <p className="mt-2">
              Thank you for reading! Share this article if you found it helpful.
            </p>
          </div>
        </footer>
      </article>

      <section className="bg-white border-t py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Other articles from &ldquo;{article.category?.name}&rdquo;
          </h2>

          {relatedArticles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <div
                  key={relatedArticle.id}
                  onClick={() => handleRelatedArticleClick(relatedArticle.id)}
                  className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="h-48 overflow-hidden">
                    {isValidImageUrl(relatedArticle.imageUrl) ? (
                      <Image
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Eye className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

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

                    <div className="mt-3 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>Read article</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No other articles found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
