import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-semibold text-foreground mb-4">
          {t('notFound:title', { defaultValue: 'Page Not Found' })}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t('notFound:message', { defaultValue: 'The page you are looking for does not exist.' })}
        </p>
        <Button asChild className="inline-flex items-center gap-2">
          <a href="/">
            <Home className="h-4 w-4" />
            {t('notFound:returnHome', { defaultValue: 'Return to Home' })}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;