"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Loader2,
  Send,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  Eye as EyeIcon,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setSaveLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [isDebugging, setIsDebugging] = useState(false)

  // Questions state
  const [userQuestions, setUserQuestions] = useState([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [questionsPagination, setQuestionsPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    hasMore: false,
    totalPages: 0,
  })
  const [questionsSortBy, setQuestionsSortBy] = useState("newest")

  // Fetch user data on component mount
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }

    fetchUserProfile()
  }, [status, session])

  // Fetch user questions when userData is available
  useEffect(() => {
    if (userData?._id) {
      fetchUserQuestions()
    }
  }, [userData?._id, questionsSortBy])

  // Handle URL parameters for success/error messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'email-verified') {
      setSaveSuccess(true)
      // Refresh user data to get updated verification status
      fetchUserProfile()
      // Clear the URL parameter
      router.replace('/profile')
    }

    if (error) {
      let errorMessage = 'An error occurred'
      switch (error) {
        case 'invalid-token':
          errorMessage = 'Invalid verification token'
          break
        case 'invalid-or-expired-token':
          errorMessage = 'Verification token is invalid or has expired'
          break
        case 'verification-failed':
          errorMessage = 'Email verification failed'
          break
      }
      setErrors({ general: errorMessage })
      // Clear the URL parameter
      router.replace('/profile')
    }
  }, [searchParams, router])

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      const user = await response.json()
      setUserData(user)
      
      // Update form data with user data
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setErrors({ general: 'Failed to load profile data' })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const fetchUserQuestions = async (page = 1) => {
    if (!userData?._id) return

    try {
      setIsLoadingQuestions(true)
      const response = await fetch(
        `/api/questions/user/${userData._id}?page=${page}&limit=${questionsPagination.limit}&sortBy=${questionsSortBy}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      
      const data = await response.json()
      
      if (page === 1) {
        setUserQuestions(data.questions)
      } else {
        setUserQuestions(prev => [...prev, ...data.questions])
      }
      
      setQuestionsPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching user questions:', error)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const loadMoreQuestions = () => {
    if (questionsPagination.hasMore && !isLoadingQuestions) {
      fetchUserQuestions(questionsPagination.page + 1)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const sendVerificationEmail = async () => {
    try {
      setIsSendingVerification(true)
      setErrors({})

      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification email')
      }

      setVerificationSent(true)
      // Hide success message after 5 seconds
      setTimeout(() => setVerificationSent(false), 5000)
    } catch (error) {
      console.error('Error sending verification email:', error)
      setErrors({ verification: error.message })
    } finally {
      setIsSendingVerification(false)
    }
  }

  // Validation functions
  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be 50 characters or less"
    }

    // Bio validation (optional but with reasonable limit)
    if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be 500 characters or less"
    }

    // Password validation (only if changing password)
    if (isChangingPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required"
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required"
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaveLoading(true)
    setErrors({})

    try {
      // Update profile data
      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
        })
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Update password if changing
      if (isChangingPassword) {
        const passwordResponse = await fetch('/api/profile/change-password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        })

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json()
          throw new Error(errorData.error || 'Failed to change password')
        }
      }

      // Refresh user data
      await fetchUserProfile()
      
      setSaveSuccess(true)

      // Reset password fields if password was changed
      if (isChangingPassword) {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
        setIsChangingPassword(false)
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ general: error.message })
    } finally {
      setSaveLoading(false)
    }
  }

  const profileCompleteness = () => {
    if (!userData) return 0
    
    let completed = 0
    const total = 3

    if (formData.name.trim()) completed++
    if (userData.email) completed++
    if (formData.bio.trim()) completed++
    // Removed image from completeness calculation

    return (completed / total) * 100
  }

  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load profile</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile data.</p>
          <Button onClick={fetchUserProfile} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Edit Profile
                </CardTitle>
                <p className="text-muted-foreground">Update your profile information and account settings</p>
              </CardHeader>
              <CardContent>
                {/* Success Message */}
                {saveSuccess && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Profile updated successfully!</span>
                    </div>
                  </div>
                )}

                {/* Verification Success Message */}
                {verificationSent && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Verification email sent! Please check your inbox.</span>
                    </div>
                  </div>
                )}

                {/* General Error */}
                {errors.general && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800">{errors.general}</span>
                    </div>
                  </div>
                )}

                {/* Verification Error */}
                {errors.verification && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800">{errors.verification}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`bg-white/50 border-gray-200 focus:bg-white transition-colors ${
                          errors.name ? "border-red-300 focus:border-red-500" : ""
                        }`}
                        maxLength={50}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Your display name on the platform</span>
                        <span>{formData.name.length}/50</span>
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          value={userData.email}
                          disabled
                          className="bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {userData.emailVerified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Email verified</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span className="text-yellow-600">Email not verified</span>
                            </>
                          )}
                        </div>
                        {!userData.emailVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={sendVerificationEmail}
                            disabled={isSendingVerification}
                            className="bg-white/50 hover:bg-white transition-colors"
                          >
                            {isSendingVerification ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Verification
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {/* Debug Info Display */}
                      {debugInfo && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-semibold text-sm mb-2">Debug Information:</h4>
                          <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(debugInfo, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-base font-medium">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell us about yourself..."
                        className={`min-h-24 resize-none bg-white/50 border-gray-200 focus:bg-white transition-colors ${
                          errors.bio ? "border-red-300 focus:border-red-500" : ""
                        }`}
                        maxLength={500}
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.bio}
                        </p>
                      )}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>A brief description about yourself</span>
                        <span>{formData.bio.length}/500</span>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Password</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="bg-white/50 hover:bg-white transition-colors"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {isChangingPassword ? "Cancel" : "Change Password"}
                      </Button>
                    </div>

                    {isChangingPassword && (
                      <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-base font-medium">
                            Current Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                              className={`bg-white/50 border-gray-200 focus:bg-white transition-colors pr-10 ${
                                errors.currentPassword ? "border-red-300 focus:border-red-500" : ""
                              }`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {errors.currentPassword && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.currentPassword}
                            </p>
                          )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-base font-medium">
                            New Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => handleInputChange("newPassword", e.target.value)}
                              className={`bg-white/50 border-gray-200 focus:bg-white transition-colors pr-10 ${
                                errors.newPassword ? "border-red-300 focus:border-red-500" : ""
                              }`}
                              minLength={8}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {errors.newPassword && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.newPassword}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-base font-medium">
                            Confirm New Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                              className={`bg-white/50 border-gray-200 focus:bg-white transition-colors pr-10 ${
                                errors.confirmPassword ? "border-red-300 focus:border-red-500" : ""
                              }`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* User's Questions Section */}
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      My Questions
                    </CardTitle>
                    <p className="text-muted-foreground">Questions you've asked on the platform</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={questionsSortBy} onValueChange={setQuestionsSortBy}>
                      <SelectTrigger className="w-40 bg-white/50">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="most-voted">Most Voted</SelectItem>
                        <SelectItem value="most-answers">Most Answers</SelectItem>
                        <SelectItem value="most-views">Most Views</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => router.push('/ask')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingQuestions && userQuestions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading your questions...</p>
                    </div>
                  </div>
                ) : userQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No questions yet</h3>
                    <p className="text-gray-500 mb-6">Start asking questions to help others and build your reputation!</p>
                    <Button
                      onClick={() => router.push('/ask')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ask Your First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userQuestions.map((question) => (
                      <div
                        key={question._id}
                        className="p-4 bg-white/50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/questions/${question._id}`}
                              className="block group"
                            >
                              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                                {question.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {question.content}
                            </p>
                            
                            {/* Tags */}
                            {question.tags && question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {question.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {question.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{question.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{question.votes?.length || 0} votes</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{question.answers?.length || 0} answers</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <EyeIcon className="w-4 h-4" />
                                <span>{question.views || 0} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(question.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Load More Button */}
                    {questionsPagination.hasMore && (
                      <div className="text-center pt-4">
                        <Button
                          onClick={loadMoreQuestions}
                          disabled={isLoadingQuestions}
                          variant="outline"
                          className="bg-white/50 hover:bg-white"
                        >
                          {isLoadingQuestions ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Load More Questions
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Pagination Info */}
                    {userQuestions.length > 0 && (
                      <div className="text-center text-sm text-gray-500 pt-2">
                        Showing {userQuestions.length} of {questionsPagination.total} questions
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{Math.round(profileCompleteness())}%</div>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                  <Progress value={profileCompleteness()} className="h-2" />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Name</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email</span>
                      {userData.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bio</span>
                      {formData.bio.trim() ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant="outline" className="capitalize">
                      {userData.role}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <Badge variant="secondary" className="capitalize">
                      {userData.provider}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Username</span>
                    <Badge variant="outline" className="font-mono">
                      @{userData.username}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email Status</span>
                    <Badge variant={userData.emailVerified ? "default" : "secondary"} className="capitalize">
                      {userData.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{new Date(userData.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-medium">{new Date(userData.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Stats */}
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Questions Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Questions</span>
                    <span className="font-semibold text-lg">{questionsPagination.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Views</span>
                    <span className="font-medium">
                      {userQuestions.reduce((sum, q) => sum + (q.views || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Votes</span>
                    <span className="font-medium">
                      {userQuestions.reduce((sum, q) => sum + (q.votes?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Answers</span>
                    <span className="font-medium">
                      {userQuestions.reduce((sum, q) => sum + (q.answers?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
