"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [mongoStatus, setMongoStatus] = useState("connecting");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        const response = await fetch('/api/check-db');
        const data = await response.json();
        
        if (data.connected) {
          setMongoStatus("connected");
          setTimeout(() => {
            router.push('/questions');
          }, 1500);
        } else {
          setMongoStatus("not connected");
          setLoading(false);
        }
      } catch (error) {
        console.error("Database connection error:", error);
        setMongoStatus("error");
        setLoading(false);
      }
    };

    checkDatabaseConnection();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            {/* <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            /> */}
            <h2 className="text-4xl font-semibold">StackIt</h2>
          </div>
          
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {mongoStatus === "connecting" && "Connecting to database..."}
              {mongoStatus === "connected" && "Database connected! Redirecting..."}
              {mongoStatus === "not connected" && "Database connection failed"}
              {mongoStatus === "error" && "Connection error occurred"}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400">
              {mongoStatus === "connecting" && "Please wait while we establish a connection"}
              {mongoStatus === "connected" && "Taking you to the questions page"}
              {mongoStatus === "not connected" && "Please check your database configuration"}
              {mongoStatus === "error" && "Please try refreshing the page"}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              mongoStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
              mongoStatus === "connected" ? "bg-green-500" :
              "bg-red-500"
            }`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              MongoDB: {mongoStatus}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="flex justify-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={25}
            priority
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Connection Failed
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400">
            Unable to connect to the database. Please check your configuration and try again.
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              MongoDB: {mongoStatus}
            </span>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}
