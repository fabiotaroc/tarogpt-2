import { Button } from "@/components/ui/button";
import { IconDownload } from "@/components/ui/icons";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ChartDownloadButtonProps {
  chartId: string;
}

export function ChartDownloadButton({ chartId }: ChartDownloadButtonProps) {
  const downloadChart = async () => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      toast.error('Chart element not found');
      return;
    }

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Chart downloaded successfully');
    } catch (error) {
      console.error("Error downloading chart:", error);
      toast.error('Failed to download chart');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={downloadChart}
      className="ml-auto"
    >
      <IconDownload className="mr-2 h-4 w-4" />
      Download PNG
    </Button>
  );
} 