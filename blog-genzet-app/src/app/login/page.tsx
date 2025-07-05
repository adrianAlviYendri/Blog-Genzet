"use client";

import axios from "axios";
import { Newspaper, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(5, "Password must be at least 5 characters")
    .max(100, "Password must be less than 100 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  role: "User" | "Admin";
}

export default function LoginScreen() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "aniani",
      password: "12345",
    },
  });

  // ✅ Helper function (tidak dipanggil saat render)
  function getCookie(name: string): string | undefined {
    if (typeof window === "undefined") return undefined; // Check if we're in browser
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }

  // ✅ Check auth dalam useEffect (client-side only)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getCookie("token");
        const role = getCookie("role");

        if (token && role) {
          if (role === "Admin") {
            router.push("/admin");
          } else if (role === "User") {
            router.push("/user");
          } else {
            router.push("/");
          }
          return;
        }
      } catch (error) {
        console.log("🚀 ~ checkAuth ~ error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure=${
      location.protocol === "https:"
    }`;
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      const result = await axios.post(
        "https://test-fe.mysellerpintar.com/api/auth/login",
        data
      );

      console.log("🚀 ~ Login success:", result);

      const responseData: LoginResponse = result.data;

      setCookie("token", responseData.token, 7);
      setCookie("role", responseData.role, 7);

      if (responseData.role === "Admin") {
        router.push("/admin");
      } else if (responseData.role === "User") {
        router.push("/user");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.log("🚀 ~ Login error:", error);

      if (error.response?.status === 401) {
        setError("password", {
          type: "manual",
          message: "Invalid username or password",
        });
      } else if (error.response?.status === 400) {
        setError("username", {
          type: "manual",
          message: "Invalid username format",
        });
      } else {
        setError("root", {
          type: "manual",
          message: "Login failed. Please try again.",
        });
      }
    }
  };

  // ✅ Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Blog Genzet</h2>
          <p className="text-gray-600">
            Sign in to your account to access the latest news
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                {...register("username")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                  errors.username
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                {...register("password")}
                type="password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 text-gray-900 placeholder-gray-500 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in to Dashboard
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
