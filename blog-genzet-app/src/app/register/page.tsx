"use client";

import axios from "axios";
import { UserPlus, Newspaper } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(5, "Password must be at least 5 characters")
    .max(100, "Password must be less than 100 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { push } = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearErrors();

      const registerData = {
        ...data,
        role: "User" as const,
      };

      const result = await axios.post(
        "https://test-fe.mysellerpintar.com/api/auth/register",
        registerData
      );
      console.log("🚀 ~ Register success:", result);

      push(
        "/login?message=Registration successful! Please login with your credentials."
      );
    } catch (error: unknown) {
      console.log("🚀 ~ Register error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setError("username", {
            type: "manual",
            message: "Username already exists",
          });
        } else if (error.response?.status === 400) {
          setError("root", {
            type: "manual",
            message: "Invalid registration data",
          });
        } else {
          setError("root", {
            type: "manual",
            message: "Registration failed. Please try again.",
          });
        }
      } else {
        setError("root", {
          type: "manual",
          message: "Registration failed. Please try again.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Blog Genzet</h2>
          <p className="text-gray-600">
            Create your account to start reading amazing content
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    You will be registered as a{" "}
                    <span className="font-semibold">User</span> and can access
                    all articles and content.
                  </p>
                </div>
              </div>
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
                    Creating Account...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
