import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentItem } from "./CommentItem";
import { AddComment } from "./AddComment";
import { MessageCircle } from "lucide-react";

interface Comment {
  id: string;
  contact_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface ContactCommentsProps {
  contactId: string;
}

export function ContactComments({ contactId }: ContactCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation(["contacts", "common"]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_comments")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, email")
            .eq("user_id", comment.user_id)
            .single();
          
          return {
            ...comment,
            user_profiles: profile
          };
        })
      );
      
      setComments(commentsWithProfiles);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Fehler",
        description: "Kommentare konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contactId]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments([newComment, ...comments]);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(comments.map(c => c.id === updatedComment.id ? updatedComment : c));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Kommentare ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddComment contactId={contactId} onCommentAdded={handleCommentAdded} />
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Lade Kommentare...</div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-muted-foreground">Noch keine Kommentare vorhanden</div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onCommentDeleted={handleCommentDeleted}
                onCommentUpdated={handleCommentUpdated}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}