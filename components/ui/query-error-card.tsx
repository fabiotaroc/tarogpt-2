import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QueryErrorCardProps {
  error: string;
}

export function QueryErrorCard({ error }: QueryErrorCardProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">
          Error Executing Query
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{error}</p>
      </CardContent>
    </Card>
  );
}
