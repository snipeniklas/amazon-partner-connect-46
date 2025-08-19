import React, { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Check, X, User } from "lucide-react";

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

interface CommentItemProps {
  comment: Comment;
  onCommentDeleted: (commentId: string) => void;
  onCommentUpdated: (comment: Comment) => void;
}

export function CommentItem({ comment, onCommentDeleted, onCommentUpdated }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if current user is the comment author
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getUser();
  }, []);

  const isOwner = currentUser === comment.user_id;

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_comments")
        .update({ comment_text: editText.trim() })
        .eq("id", comment.id)
        .select("*")
        .single();

      if (error) throw error;

      // Fetch user profile for updated comment
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email")
        .eq("user_id", data.user_id)
        .single();
      
      onCommentUpdated({
        ...data,
        user_profiles: profile
      });
      setIsEditing(false);
      toast({
        title: "Kommentar aktualisiert",
        description: "Der Kommentar wurde erfolgreich bearbeitet",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("contact_comments")
        .delete()
        .eq("id", comment.id);

      if (error) throw error;
      
      onCommentDeleted(comment.id);
      toast({
        title: "Kommentar gelöscht",
        description: "Der Kommentar wurde erfolgreich entfernt",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    const profile = comment.user_profiles;
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.email || 'Unbekannter Benutzer';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: de });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{getUserDisplayName()}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
              {comment.updated_at !== comment.created_at && " • bearbeitet"}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Kommentar löschen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sind Sie sicher, dass Sie diesen Kommentar löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Kommentar bearbeiten..."
            rows={3}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isLoading || !editText.trim()}
            >
              <Check className="h-3 w-3 mr-1" />
              Speichern
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.comment_text);
              }}
              disabled={isLoading}
            >
              <X className="h-3 w-3 mr-1" />
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm whitespace-pre-wrap">{comment.comment_text}</div>
      )}
    </Card>
  );
}