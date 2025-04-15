import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X, Plus } from "lucide-react";
import uploadService from "@/services/upload";

interface FilePreview {
  id: string; // Either the file name or a uniquely generated id
  url: string;
  file?: File;
}

interface MultiFileUploadProps {
  onFilesChange: (files: File[]) => void;
  currentImages?: string[];
  accept?: string;
  className?: string;
  maxSizeMB?: number;
  previewClassName?: string;
  buttonText?: string;
  previewHeight?: string;
  previewWidth?: string;
  maxFiles?: number;
}

const MultiFileUpload = ({
  onFilesChange,
  currentImages = [],
  accept = "image/*",
  className,
  maxSizeMB = 5,
  previewClassName,
  buttonText = "Add Images",
  previewHeight = "h-24",
  previewWidth = "w-24",
  maxFiles = 5,
}: MultiFileUploadProps) => {
  // Initialize with current images, if any
  const [previews, setPreviews] = useState<FilePreview[]>(
    currentImages.map((img, index) => ({
      id: `existing-${index}`,
      url: uploadService.getImageUrl(img),
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }
    
    // Check if adding these files would exceed the maximum
    if (previews.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }
    
    // Convert FileList to array and check size of each file
    const newFiles: File[] = [];
    const newPreviews: FilePreview[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        continue;
      }
      
      // Create preview and add to state
      const id = `file-${Date.now()}-${i}`;
      const objectUrl = URL.createObjectURL(file);
      
      newFiles.push(file);
      newPreviews.push({
        id,
        url: objectUrl,
        file,
      });
    }
    
    if (newFiles.length > 0) {
      setError(null);
      setPreviews(prev => [...prev, ...newPreviews]);
      setFiles(prev => [...prev, ...newFiles]);
      onFilesChange([...files, ...newFiles]);
    }
    
    // Reset the input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    // Find the preview to remove
    const previewToRemove = previews.find(p => p.id === id);
    
    // Remove the preview
    setPreviews(prev => prev.filter(p => p.id !== id));
    
    // If it's a new file (not an existing image), remove it from files array
    if (previewToRemove?.file) {
      const updatedFiles = files.filter(f => {
        // This is a simple way to compare files, might not be 100% accurate
        return !(f.name === previewToRemove.file?.name && f.size === previewToRemove.file?.size);
      });
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
    
    // Revoke object URL if it's a new file
    if (previewToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove.url);
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
          disabled={previews.length >= maxFiles}
        >
          <Plus className="h-4 w-4" />
          {buttonText} {previews.length > 0 && `(${previews.length}/${maxFiles})`}
        </Button>
        
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          multiple
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {previews.map((preview) => (
            <div 
              key={preview.id} 
              className="relative group"
            >
              <div className={cn("rounded-md overflow-hidden border", previewHeight, previewWidth)}>
                <img 
                  src={preview.url} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveFile(preview.id)}
                className="absolute -top-2 -right-2 h-6 w-6 opacity-80 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload; 