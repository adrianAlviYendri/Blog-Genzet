"use client";

import axios from "axios";
import { Newspaper, LogIn } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";

export default function LoginScreen() {
  const [user, setUser] = useState({
    username: "testaja2",
    password: "12345",
  });

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await axios.post(
        "https://test-fe.mysellerpintar.com/api/auth/login",
        user
      );
      console.log("🚀 ~ handleLogin ~ result:", result);
    } catch (error) {
      console.log("🚀 ~ handleLogin ~ error:", error);
    }
  }

  function change(e: ChangeEvent<HTMLInputElement>) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Blog Genzet</h2>
          <p className="text-gray-600">
            Sign in to your account to access the latest news
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                value={user.username}
                onChange={change}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter your username"
              />
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
                name="password"
                value={user.password}
                onChange={change}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign in to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign up now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
