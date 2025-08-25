import { toast } from "sonner";

// Download Video from URL
export const downloadVideoFromUrl = (
  videoUrl: string,
  messageIndex?: number
) => {
  try {
    if (!videoUrl) {
      toast.error("No video URL to download");
      return;
    }

    toast.loading("Preparing video download...", { id: "video-download" });

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `nala-generated-video-${messageIndex || "single"}-${
      new Date().toISOString().split("T")[0]
    }.mp4`;
    link.target = "_blank"; // Open in new tab as fallback

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Video download started!", { id: "video-download" });
  } catch (error) {
    console.error("Error downloading video:", error);
    toast.error("Failed to download video. Please try again.", {
      id: "video-download",
    });
  }
};
