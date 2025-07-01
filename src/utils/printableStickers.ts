
import { supabase } from '@/integrations/supabase/client';

export const downloadPrintableStickers = async () => {
  try {
    // Fetch the latest printable file from the database
    const { data: printableFile, error } = await supabase
      .from('printable_files')
      .select('file_url, file_name')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching printable file:', error);
      throw new Error('Failed to fetch printable file');
    }

    if (!printableFile) {
      throw new Error('No printable file available');
    }

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = printableFile.file_url;
    link.download = printableFile.file_name || 'stckr-printable-sticker-sheet.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
