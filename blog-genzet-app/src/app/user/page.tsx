import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import UserArticlesClient from "@/Components/UserArticle";

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

interface ArticleResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

interface CategoryResponse {
  data: Category[];
  totalData: number;
  currentPage: number;
  totalPages: number;
}

interface ProfileResponse {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchProfile(token: string): Promise<ProfileResponse | null> {
  try {
    const { data } = await axios.get<ProfileResponse>(
      "https://test-fe.mysellerpintar.com/api/auth/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

async function fetchAllArticles(): Promise<Article[]> {
  try {
    const { data } = await axios.get<ArticleResponse>(
      "https://test-fe.mysellerpintar.com/api/articles?limit=1000"
    );
    return data.data;
  } catch (error) {
    return [];
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const { data } = await axios.get<CategoryResponse>(
      "https://test-fe.mysellerpintar.com/api/categories?limit=1000"
    );
    return data.data;
  } catch (error) {
    return [];
  }
}

export default async function UserArticlesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const profile = await fetchProfile(token);

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "User") {
    redirect("/admin");
  }

  const [allArticles, categories] = await Promise.all([
    fetchAllArticles(),
    fetchCategories(),
  ]);

  return (
    <UserArticlesClient
      initialProfile={profile}
      initialArticles={allArticles}
      initialCategories={categories}
    />
  );
}
