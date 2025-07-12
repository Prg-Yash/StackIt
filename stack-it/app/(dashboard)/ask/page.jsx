"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, X, Tag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { set } from "mongoose";

const page = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const FLASKAUTH_URL = process.env.FLASKAUTH_URL || "http://0.0.0.0:5000";

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/questions/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          tags,
          // Images will be handled later with S3
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post question");
      }

      // Redirect to the questions page after successful submission
      window.location.href = "/questions";
    } catch (error) {
      console.error("Error posting question:", error);
      // Here you might want to show an error toast/notification to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToxicityCheck = async (text) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASKAUTH_URL}/toxic-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "text": text }),
      });

      if (!response.ok) {
        throw new Error("Failed to check toxicity");
      }

      const data = await response.json();
      console.log("Toxicity check response:", data);
      return data.flagged;
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return false;
    }
  };

  const handleGenerateTags = async (question) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLASKAUTH_URL}/generate-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "question": question }),
      });

      if (!response.ok) {
        throw new Error("Failed to check toxicity");
      }

      const data = await response.json();
      return data.tags;
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return [];
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Ask a Public Question</CardTitle>
            <p className="text-muted-foreground">
              Get help from the community by asking a clear, detailed question
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., How to implement authentication in Next.js?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={(e) => {
                    handleToxicityCheck(e.target.value).then((isToxic) => {
                      if (isToxic) {
                        setTitle("");
                      }
                    });
                  }}
                  className="text-lg"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Be specific and imagine you're asking a question to another
                  person
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <TiptapEditor
                  content={description}
                  onChange={setDescription}
                  onBlur={(e) => {
                    handleToxicityCheck(e.target.value).then((isToxic) => {
                      if (isToxic) {
                        setDescription("");
                      }
                    });
                  }}
                  placeholder="Provide details about your question. Include what you've tried, what you expected to happen, and what actually happened..."
                />
                <p className="text-sm text-muted-foreground">
                  Include all the information someone would need to answer your
                  question
                </p>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label htmlFor="images">Images (Optional)</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("images")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Images
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Add screenshots or diagrams to help explain your question
                    </p>
                  </div>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                            <span className="text-sm text-muted-foreground truncate px-2">
                              {image.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags *</Label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="tags"
                        placeholder="e.g., nextjs, react, authentication"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!currentTag.trim()}
                    >
                      Add Tag
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        handleGenerateTags(title).then((generatedTags) => {
                          if (generatedTags.length > 0) {
                            setTags([...new Set([...tags, ...generatedTags])]);
                          }
                        });
                      }}
                      disabled={!title.trim()}
                    >
                      Generate Tag
                    </Button>
                  </div>

                  {/* Tags Display */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Add up to 5 tags to describe what your question is about
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href="/questions">
                  <Button type="button" variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Question
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
