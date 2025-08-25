import { toast } from "sonner";

// Download Image from Base64
export const downloadImageFromBase64 = (
  base64Data: string,
  messageIndex?: number
) => {
  try {
    if (!base64Data) {
      toast.error("No image data to download");
      return;
    }

    toast.loading("Preparing image download...", { id: "image-download" });

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `nala-generated-image-${messageIndex || "single"}-${
      new Date().toISOString().split("T")[0]
    }.png`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Image downloaded successfully!", { id: "image-download" });
  } catch (error) {
    console.error("Error downloading image:", error);
    toast.error("Failed to download image. Please try again.", {
      id: "image-download",
    });
  }
};
