
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrintableFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

const PrintableFileUpload = () => {
  const { toast } = useToast();
  const [currentFile, setCurrentFile] = useState<PrintableFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadCurrentFile();
  }, []);

  const loadCurrentFile = async () => {
    try {
      const { data, error } = await supabase
        .from('printable_files')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading current file:', error);
        return;
      }

      setCurrentFile(data);
    } catch (error) {
      console.error('Error loading current file:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileName = `printable-sticker-sheet-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('printable-files')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('printable-files')
        .getPublicUrl(fileName);

      // Save file record to database
      const { error: dbError } = await supabase
        .from('printable_files')
        .insert({
          file_name: selectedFile.name,
          file_url: publicUrl,
          file_size: selectedFile.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) throw dbError;

      // Delete old file from storage if it exists
      if (currentFile) {
        const oldFileName = currentFile.file_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('printable-files')
            .remove([oldFileName]);
        }
      }

      toast({
        title: 'Upload Successful',
        description: 'Printable sticker file has been updated',
      });

      setSelectedFile(null);
      loadCurrentFile();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentFile || !confirm('Are you sure you want to delete the current printable file?')) return;

    try {
      // Delete from storage
      const fileName = currentFile.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('printable-files')
          .remove([fileName]);
      }

      // Delete from database
      await supabase
        .from('printable_files')
        .delete()
        .eq('id', currentFile.id);

      toast({
        title: 'File Deleted',
        description: 'Printable sticker file has been removed',
      });

      setCurrentFile(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Printable Sticker File Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload a downloadable print file for users who want to print stickers at home (A4 or US Letter recommended). 
          This will be linked on the user-facing Scan page.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current File Display */}
        {currentFile && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Current File</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-medium">{currentFile.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(currentFile.file_size)} • Uploaded {new Date(currentFile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentFile.file_url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload New File */}
        <div className="space-y-4">
          <h3 className="font-medium">
            {currentFile ? 'Replace File' : 'Upload New File'}
          </h3>
          
          <div>
            <Label htmlFor="file-upload">Select PDF File (Max 10MB)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {selectedFile && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : (currentFile ? 'Replace File' : 'Upload File')}
          </Button>
        </div>

        {/* Usage Info */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Usage Information</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This file will be downloaded when users click "Print at Home" on the Scanner page</li>
            <li>• Recommended formats: A4 or US Letter</li>
            <li>• Include proper QR codes and cutting guides for best results</li>
            <li>• File must be in PDF format and under 10MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintableFileUpload;
