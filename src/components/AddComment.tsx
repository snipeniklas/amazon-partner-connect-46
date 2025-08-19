import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

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

interface AddCommentProps {
  contactId: string;
  onCommentAdded: (comment: Comment) => void;
}

export function AddComment({ contactId, onCommentAdded }: AddCommentProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Fehler",
          description: "Sie müssen angemeldet sein, um Kommentare zu schreiben",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("contact_comments")
        .insert({
          contact_id: contactId,
          user_id: user.id,
          comment_text: comment.trim()
        })
        .select("*")
        .single();

      if (error) throw error;

      // Fetch user profile for new comment
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email")
        .eq("user_id", data.user_id)
        .single();

      onCommentAdded({
        ...data,
        user_profiles: profile
      });
      setComment("");
      toast({
        title: "Kommentar hinzugefügt",
        description: "Ihr Kommentar wurde erfolgreich gespeichert",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 border-dashed">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Neuen Kommentar hinzufügen... (z.B. Telefongespräch, Meeting-Notizen, etc.)"
          rows={3}
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !comment.trim()}
          >
            <Send className="h-3 w-3 mr-2" />
            {isLoading ? "Speichern..." : "Kommentar hinzufügen"}
          </Button>
        </div>
      </form>
    </Card>
  );
}