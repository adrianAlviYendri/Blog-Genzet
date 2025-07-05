import { notFound } from "next/navigation";
import axios from "axios";
import ArticleDetailClient from "@/Components/UserArticleDetail";

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

async function fetchArticleDetail(id: string): Promise<Article | null> {
  try {
    const { data } = await axios.get<ArticleDetailResponse>(
      `https://test-fe.mysellerpintar.com/api/articles/${id}`
    );
    return data;
  } catch (error) {
    return null;
  }
}

async function fetchRelatedArticles(
  categoryName: string,
  currentArticleId: string
): Promise<Article[]> {
  try {
    const { data } = await axios.get<ArticleListResponse>(
      `https://test-fe.mysellerpintar.com/api/articles?limit=100`
    );

    const filtered = data.data
      .filter(
        (article) =>
          article.category?.name === categoryName &&
          article.id !== currentArticleId
      )
      .slice(0, 3);

    return filtered;
  } catch (error) {
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const article = await fetchArticleDetail(id);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.content.replace(/<[^>]*>/g, "").slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.replace(/<[^>]*>/g, "").slice(0, 160),
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await fetchArticleDetail(id);

  if (!article) {
    notFound();
  }

  const relatedArticles = await fetchRelatedArticles(
    article.category?.name || "",
    article.id
  );

  return (
    <ArticleDetailClient
      initialArticle={article}
      initialRelatedArticles={relatedArticles}
    />
  );
}
