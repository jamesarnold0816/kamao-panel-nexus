import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  currentImage?: string;
  accept?: string;
  className?: string;
  maxSizeMB?: number;
  previewClassName?: string;
  buttonText?: string;
  previewHeight?: string;
  previewWidth?: string;
}

const FileUpload = ({
  onFileChange,
  currentImage,
  accept = "image/*",
  className,
  maxSizeMB = 5,
  previewClassName,
  buttonText = "Upload Image",
  previewHeight = "h-48",
  previewWidth = "w-full",
}: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setPreview(currentImage || null);
      onFileChange(null);
      return;
    }
    
    // Check file size (max 5MB by default)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    
    setError(null);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Call the callback
    onFileChange(file);
    
    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleRemoveFile = () => {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          {buttonText}
        </Button>
        
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        
        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveFile}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {preview && (
        <div className={cn("mt-2", previewClassName)}>
          <img 
            src={preview} 
            alt="Preview" 
            className={cn("rounded-md object-cover", previewHeight, previewWidth)} 
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload; 