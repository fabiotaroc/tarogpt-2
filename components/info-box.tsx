import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function InfoBox() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>About TaroGPT</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Ask questions about your data in natural language. 
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
          <li>Translate natural language to SQL</li>
          <li>Execute queries instantly</li>
          <li>View results in a clean, formatted table you can export</li>
        </ul>
      </CardContent>
    </Card>
  );
}
