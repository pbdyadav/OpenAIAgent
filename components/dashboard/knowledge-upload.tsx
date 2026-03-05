"use client";

import React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Type, Loader2, Plus, CloudUpload } from "lucide-react";

interface KnowledgeUploadProps {
  companyId: string;
}

export function KnowledgeUpload({ companyId }: KnowledgeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
  try {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", companyId);

    const res = await fetch("/api/knowledge/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    router.refresh();

  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsUploading(false);
  }
};

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        await processFile(files[0]);
      }
    },
    [companyId, supabase, router]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim() || !textTitle.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("knowledge_documents")
        .insert({
          company_id: companyId,
          file_name: textTitle,  // ✅ changed
          content: textContent,
          file_type: "text/plain",
          file_size: new Blob([textContent]).size,
          processed: true,
        });

      if (dbError) throw dbError;

      setTextContent("");
      setTextTitle("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Add Knowledge</CardTitle>
            <CardDescription>
              Upload files or paste text content for your AI agent to learn from
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file">
          <TabsList className="mb-6 bg-secondary/50 border border-border/50 p-1">
            <TabsTrigger value="file" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Type className="w-4 h-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <div
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${dragActive
                ? "border-primary bg-primary/5"
                : "border-border/50 hover:border-primary/50 bg-secondary/30"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <CloudUpload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-1">
                Drag and drop a file here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Supports TXT, MD, PDF (text extraction coming soon)
              </p>
              <Input
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <Button asChild disabled={isUploading} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </>
                  )}
                </label>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="text">
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-foreground">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Product FAQ, Return Policy"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  disabled={isUploading}
                  className="bg-input border-border focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="content" className="text-foreground">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your content here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isUploading}
                  rows={8}
                  className="bg-input border-border focus:border-primary resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isUploading || !textContent.trim() || !textTitle.trim()}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
