import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  content: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ content }) => {
  return (
    <Card className="border-destructive bg-destructive/10">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-destructive rounded-full"></div>
          <p className="text-destructive font-medium">Error</p>
        </div>
        <p className="text-destructive/80 mt-2">{content}</p>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
