import * as React from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string | File;
  onChange: (file: File | null) => void;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  maxSize = 5,
  accept = 'image/*',
  className,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
    } else {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    onChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!preview ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'hover:border-primary relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-red-500'
          )}
        >
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs">PNG, JPG, GIF up to {maxSize}MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-64 w-full rounded-lg border">
          <div className="relative h-full w-full">
            <Image src={preview} alt="Preview" fill className="rounded-lg object-contain" />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
