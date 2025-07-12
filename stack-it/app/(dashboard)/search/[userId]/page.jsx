"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Eye,
  Loader2,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  
  const [userData, setUserData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
    }
  }, [status, router])

  // Fetch user data
  useEffect(() => {
    if (status === 'loading' || !params.userId) return

    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/users/${params.userId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found')
          }
          throw new Error('Failed to load user data')
        }
        
        const data = await response.json()
        setUserData(data.user)
        setQuestions(data.questions)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [params.userId, status])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRelativeDate = (dateString) => {
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading user profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/search')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/search')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          onClick={() => router.push('/search')}
          variant="outline"
          className="bg-white/50 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg mx-auto mb-4">
                  <AvatarImage src={userData.image} alt={userData.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {userData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{userData.name}</h1>
                <Badge variant="secondary" className="mb-4">
                  @{userData.username}
                </Badge>
                
                {userData.bio && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {userData.bio}
                  </p>
                )}
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{userData.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(userData.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{questions.length} {questions.length === 1 ? 'question' : 'questions'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Questions ({questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No questions yet</h3>
                  <p className="text-gray-600">
                    This user hasn't asked any questions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Card 
                      key={question._id} 
                      className="bg-white/50 border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/questions/${question._id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                              {question.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                              {question.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatRelativeDate(question.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{question.views || 0} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{question.answers?.length || 0} answers</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 ml-4">
                            <span className="text-xs">View</span>
                            <TrendingUp className="w-3 h-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}