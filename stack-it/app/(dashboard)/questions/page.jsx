"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, ArrowUp, MessageSquare, Tag, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data
const mockQuestions = [
  {
    id: 1,
    title: "How to implement authentication in Next.js?",
    description:
      "I'm trying to add user authentication to my Next.js application. What are the best practices and libraries to use?",
    tags: ["nextjs", "authentication", "react"],
    votes: 15,
    answers: 3,
    author: "john_doe",
    createdAt: "2 hours ago",
    hasImage: false,
  },
  {
    id: 2,
    title: "Best practices for state management in React",
    description:
      "What are the current best practices for managing state in large React applications? Should I use Redux, Zustand, or Context API?",
    tags: ["react", "state-management", "redux", "zustand"],
    votes: 23,
    answers: 7,
    author: "react_dev",
    createdAt: "5 hours ago",
    hasImage: true,
  },
  {
    id: 3,
    title: "How to optimize database queries in PostgreSQL?",
    description: "My PostgreSQL queries are running slowly. What are some techniques to optimize them?",
    tags: ["postgresql", "database", "performance"],
    votes: 8,
    answers: 2,
    author: "db_admin",
    createdAt: "1 day ago",
    hasImage: false,
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox: When to use which?",
    description:
      "I'm confused about when to use CSS Grid and when to use Flexbox. Can someone explain the differences and use cases?",
    tags: ["css", "grid", "flexbox", "layout"],
    votes: 31,
    answers: 12,
    author: "css_ninja",
    createdAt: "2 days ago",
    hasImage: true,
  },
  {
    id: 5,
    title: "Docker containerization best practices",
    description: "What are the best practices for containerizing a Node.js application with Docker?",
    tags: ["docker", "nodejs", "containerization", "devops"],
    votes: 19,
    answers: 5,
    author: "devops_guru",
    createdAt: "3 days ago",
    hasImage: false,
  },
  {
    id: 3,
    title: "How to optimize database queries in PostgreSQL?",
    description: "My PostgreSQL queries are running slowly. What are some techniques to optimize them?",
    tags: ["postgresql", "database", "performance"],
    votes: 8,
    answers: 2,
    author: "db_admin",
    createdAt: "1 day ago",
    hasImage: false,
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox: When to use which?",
    description:
      "I'm confused about when to use CSS Grid and when to use Flexbox. Can someone explain the differences and use cases?",
    tags: ["css", "grid", "flexbox", "layout"],
    votes: 31,
    answers: 12,
    author: "css_ninja",
    createdAt: "2 days ago",
    hasImage: true,
  },
  {
    id: 5,
    title: "Docker containerization best practices",
    description: "What are the best practices for containerizing a Node.js application with Docker?",
    tags: ["docker", "nodejs", "containerization", "devops"],
    votes: 19,
    answers: 5,
    author: "devops_guru",
    createdAt: "3 days ago",
    hasImage: false,
  },
]

const allTags = [
  "nextjs",
  "authentication",
  "react",
  "state-management",
  "redux",
  "zustand",
  "postgresql",
  "database",
  "performance",
  "css",
  "grid",
  "flexbox",
  "layout",
  "docker",
  "nodejs",
  "containerization",
  "devops",
]

const page = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedTags, setSelectedTags] = useState([])

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div><div className="container mx-auto px-4 py-6">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Filters</h3>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most-voted">Most Voted</SelectItem>
                <SelectItem value="most-answers">Most Answers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Tags</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <label htmlFor={tag} className="text-sm cursor-pointer">
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter and sort questions</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="most-voted">Most Voted</SelectItem>
                      <SelectItem value="most-answers">Most Answers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Tags</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label htmlFor={`mobile-${tag}`} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{mockQuestions.length} Questions</h2>
          <div className="hidden lg:block">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most-voted">Most Voted</SelectItem>
                <SelectItem value="most-answers">Most Answers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagToggle(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {mockQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/question/${question.id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{question.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {question.author}</span>
                      <span>{question.createdAt}</span>
                      {question.hasImage && (
                        <Badge variant="secondary" className="text-xs">
                          Has Image
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 min-w-0">
                    <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                      <ArrowUp className="w-4 h-4" />
                      {question.votes}
                    </Button>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      {question.answers}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  </div></div>
  )
}

export default page