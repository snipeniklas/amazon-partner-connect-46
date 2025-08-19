import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amazon-light-blue to-amazon-gray flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold text-amazon-blue mb-4">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('description')}
          </p>
          <Link to="/auth">
            <Button className="w-full">
              Zur Anmeldung
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
