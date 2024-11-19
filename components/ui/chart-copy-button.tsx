import { Button } from "@/components/ui/button";
import { IconCopy } from "@/components/ui/icons";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ChartCopyButtonProps {
  chartId: string;
}

export function ChartCopyButton({ chartId }: ChartCopyButtonProps) {
  const copyChart = async () => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      toast.error('Chart element not found');
      return;
    }

    try {
      // Get the background color from the parent element or use white
      const bgColor = window.getComputedStyle(chartElement.parentElement || chartElement).backgroundColor;

      const canvas = await html2canvas(chartElement, {
        backgroundColor: bgColor,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          }, 'image/png', 1.0);
        } catch (err) {
          reject(err);
        }
      });

      // Copy to clipboard using the Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      toast.success('Chart copied to clipboard');
    } catch (error) {
      console.error("Error copying chart:", error);
      toast.error('Failed to copy chart. Make sure you\'re using a modern browser.');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={copyChart}
      className="ml-auto"
    >
      <IconCopy className="mr-2 h-4 w-4" />
      Copy Chart
    </Button>
  );
} 