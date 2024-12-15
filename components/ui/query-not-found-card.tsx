import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconHome } from "@/components/ui/icons";
import Link from "next/link";

export function QueryNotFoundCard() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Query Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The query you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <IconHome className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 