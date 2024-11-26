import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function InfoBox() {
  return (
    <Card className="bg-muted max-w-screen-md">
      <CardHeader>
        <CardTitle>About TaroGPT</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Ask questions about your ecommerce transactional data in natural language. TaroGPT will
          translate your questions into SQL and execute them against your
          database.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
          <li>Translate natural language to SQL</li>
          <li>Execute queries instantly</li>
          <li>View results in a clean, formatted table you can export</li>
          <li>Automatically generate beautiful charts</li>
          <li>Get intelligent insights and answers to your questions</li>
        </ul>
        <p className="text-sm mt-2 text-muted-foreground">
          TaroGPT can make mistakes. Check important info.
        </p>
      </CardContent>
    </Card>
  );
}
