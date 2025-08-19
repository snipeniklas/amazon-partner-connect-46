import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { ContactsList } from "@/components/ContactsList";
import { ContactForm } from "@/components/ContactForm";
import { FileUpload } from "@/components/FileUpload";
import { EmailSender } from "@/components/EmailSender";
import { FormsOverview } from "@/components/FormsOverview";
import { UserManagement } from "@/components/UserManagement";
import { DashboardOverview } from "@/components/DashboardOverview";
import { LatestEmailActivities } from "@/components/LatestEmailActivities";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { LogOut, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { permissions, hasAccessToContact, getAccessibleMarkets } = useUserPermissions(user);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get current active tab from URL
  const getCurrentTab = () => {
    const path = location.pathname.replace('/dashboard', '') || '/overview';
    switch (path) {
      case '/overview':
        return 'dashboard';
      case '/contacts':
        return 'list';
      case '/add-contact':
        return 'add';
      case '/upload':
        return 'upload';
      case '/email':
        return 'email';
      case '/forms':
        return 'forms';
      case '/users':
        return 'users';
      default:
        return 'dashboard';
    }
  };

  const activeTab = getCurrentTab();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchContacts();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchContacts = async () => {
    try {
      // First, get the total count of contacts
      const { count, error: countError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting contact count:', countError);
        toast({
          title: t('common:messages.error'),
          description: t('dashboard:errors.loadContacts'),
          variant: "destructive",
        });
        return;
      }

      console.log('🔍 DEBUG: Total contacts in database:', count);

      // Calculate how many batches we need (1000 per batch due to Supabase limit)
      const batchSize = 1000;
      const totalBatches = Math.ceil((count || 0) / batchSize);
      
      console.log('🔍 DEBUG: Fetching', totalBatches, 'batches of', batchSize, 'contacts each');

      // Create batch queries with comment counts
      const batchQueries = [];
      for (let i = 0; i < totalBatches; i++) {
        const startRange = i * batchSize;
        const endRange = startRange + batchSize - 1;
        
        batchQueries.push(
          supabase
            .from('contacts')
            .select('*')
            .range(startRange, endRange)
            .order('created_at', { ascending: false })
        );
      }

      // Execute all batch queries in parallel
      const batchResults = await Promise.all(batchQueries);
      
      // Check for errors in any batch
      const errorBatch = batchResults.find(result => result.error);
      if (errorBatch) {
        console.error('Error fetching contacts batch:', errorBatch.error);
        toast({
          title: t('common:messages.error'),
          description: t('dashboard:errors.loadContacts'),
          variant: "destructive",
        });
        return;
      }

      // Combine all batch results
      const contactsData = batchResults.reduce((acc, result) => {
        return acc.concat(result.data || []);
      }, [] as any[]);

      console.log('🔍 DEBUG: Fetched contacts from Supabase:', contactsData.length);

      // Get all email tracking data in one query
      const { data: allTrackingData } = await supabase
        .from('email_tracking')
        .select('contact_id, event_type');

      // Group tracking events by contact_id
      const trackingByContact = (allTrackingData || []).reduce((acc, track) => {
        if (!acc[track.contact_id]) {
          acc[track.contact_id] = [];
        }
        acc[track.contact_id].push(track.event_type);
        return acc;
      }, {} as Record<string, string[]>);

      // Get contacts that have comments (optimized query with RLS filtering)
      const { data: contactsWithComments } = await supabase
        .from('contact_comments')
        .select('contact_id');

      // Create a Set of unique contact IDs that have comments  
      const contactsWithCommentsSet = new Set(
        (contactsWithComments || []).map(c => c.contact_id)
      );

      // Add tracking data and comment flags to contacts
      const contactsWithTracking = (contactsData || []).map(contact => {
        const events = trackingByContact[contact.id] || [];
        
        return {
          ...contact,
          email_delivered: events.includes('delivered'),
          email_opened: events.includes('opened'),
          email_clicked: events.includes('clicked'),
          has_comments: contactsWithCommentsSet.has(contact.id),
        };
      });

      // Filter contacts based on user permissions
      console.log('🔍 DEBUG: User permissions:', permissions);
      console.log('🔍 DEBUG: Contacts before permission filter:', contactsWithTracking.length);
      
      const filteredContacts = contactsWithTracking.filter((contact, index) => {
        const hasAccess = hasAccessToContact(contact);
        if (index < 5) { // Log first 5 contacts for debugging
          console.log(`🔍 DEBUG: Contact ${index + 1} (${contact.company_name}) - Has Access: ${hasAccess}, Market: ${(contact as any).market}, Market Type: ${(contact as any).market_type}`);
        }
        return hasAccess;
      });
      
      console.log('🔍 DEBUG: Contacts after permission filter:', filteredContacts.length);
      setContacts(filteredContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleContactAdded = () => {
    fetchContacts();
    navigate('/dashboard/contacts');
    toast({
      title: t('common:messages.success'),
      description: t('dashboard:contacts.added'),
    });
  };

  const handleCsvUploaded = () => {
    fetchContacts();
    navigate('/dashboard/contacts');
    toast({
      title: t('common:messages.success'),
      description: t('dashboard:contacts.uploaded'),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common:messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          contactsCount={contacts.length}
          isAdmin={permissions.is_admin}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b border-border bg-card shadow-sm shrink-0">
            <div className="px-4 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <SidebarTrigger className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-amazon-blue">{t('dashboard:title')}</h1>
                    <p className="text-sm text-muted-foreground truncate">
                      {t('dashboard:welcome')}, {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LanguageSelector />
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('common:buttons.signOut')}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
              <Route path="/overview" element={
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {t('dashboard:overview.title')}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {t('dashboard:overview.subtitle')}
                    </p>
                    <DashboardOverview user={user} contacts={contacts} />
                  </div>
                  <LatestEmailActivities user={user} contacts={contacts} />
                </div>
              } />
              <Route path="/contacts" element={
                <ContactsList 
                  contacts={contacts} 
                  onContactsChange={fetchContacts}
                />
              } />
              <Route path="/add-contact" element={
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard:cards.addContact.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard:cards.addContact.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactForm onSuccess={handleContactAdded} />
                  </CardContent>
                </Card>
              } />
              <Route path="/upload" element={
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard:cards.fileUpload.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard:cards.fileUpload.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload onSuccess={handleCsvUploaded} />
                  </CardContent>
                </Card>
              } />
              <Route path="/email" element={
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard:cards.emailSending.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard:cards.emailSending.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmailSender contacts={contacts} onEmailsSent={fetchContacts} />
                  </CardContent>
                </Card>
              } />
              <Route path="/forms" element={
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard:cards.formsOverview.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard:cards.formsOverview.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormsOverview 
                      accessibleMarkets={getAccessibleMarkets()} 
                      isAdmin={permissions.is_admin}
                    />
                  </CardContent>
                </Card>
              } />
              {permissions.is_admin && (
                <Route path="/users" element={<UserManagement />} />
              )}
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;