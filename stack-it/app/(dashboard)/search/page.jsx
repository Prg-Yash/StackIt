"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  User,
  Calendar,
  MessageSquare,
  Eye,
  Loader2,
  Users,
  ArrowRight,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
    }
  }, [status, router])

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}&page=${page}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      
      if (page === 1) {
        setSearchResults(data.users)
      } else {
        setSearchResults(prev => [...prev, ...data.users])
      }
      
      setTotalResults(data.total)
      setCurrentPage(data.page)
      setHasMore(data.hasMore)
      setHasSearched(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      handleSearch(currentPage + 1)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Users</h1>
        <p className="text-gray-600">Find and connect with other users on the platform</p>
      </div>

      {/* Search Form */}
      <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={isLoading || !searchQuery.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-semibold text-gray-800">
                {totalResults} {totalResults === 1 ? 'user' : 'users'} found
              </span>
            </div>
            {searchQuery && (
              <Badge variant="outline" className="text-sm">
                "{searchQuery}"
              </Badge>
            )}
          </div>

          {/* No Results */}
          {searchResults.length === 0 && !isLoading && (
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
                <p className="text-gray-600">
                  Try searching with a different username or check your spelling.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results List */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((user) => (
                <Card 
                  key={user._id} 
                  className="bg-white/70 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/search/${user._id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              @{user.username}
                            </Badge>
                          </div>
                          {user.bio && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600 transition-colors">
                        <span className="text-sm">View Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    className="bg-white/50 hover:bg-white transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Load More Users
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Search for Users</h3>
            <p className="text-gray-600 mb-6">
              Enter a username to find and connect with other users on the platform.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Search by username to get started</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}