"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Trash2, Calendar, HardDrive, FolderOpen, CheckCircle2 } from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  content: string;
  file_type: string;
  file_size: number;
  processed: boolean;
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
  companyId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentList({ documents, companyId }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      await supabase.from("knowledge_documents").delete().eq("id", documentId);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground">Documents</CardTitle>
              <CardDescription>Your knowledge base documents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Upload files or paste text content above to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-foreground">Documents</CardTitle>
              <CardDescription>Your knowledge base documents</CardDescription>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-secondary border border-border/50 text-sm font-medium text-foreground">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/50">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-4 p-4 -mx-4 rounded-xl hover:bg-secondary/50 transition-all duration-200">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">{doc.file_name}</h4>
                      {doc.processed && (
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {doc.content.substring(0, 150)}
                      {doc.content.length > 150 ? "..." : ""}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === doc.id}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete document</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Delete document?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete &quot;{doc.file_name}&quot; from your
                        knowledge base. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border/50">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doc.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
