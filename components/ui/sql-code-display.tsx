import { CodeBlock } from "@/components/ui/codeblock";
import { maskSensitiveData } from "@/lib/utils";

interface SQLCodeDisplayProps {
  sql: string;
}

export function SQLCodeDisplay({ sql }: SQLCodeDisplayProps) {
  return <CodeBlock value={maskSensitiveData(sql)} />;
}
