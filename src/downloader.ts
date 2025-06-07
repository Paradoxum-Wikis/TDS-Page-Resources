export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  console.log('downloadImage function called with:', { imageUrl, filename });
  
  try {
    console.log('Fetching image from URL...');
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Fetch response not OK:', response.status, response.statusText);
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    console.log('Fetch successful, converting to blob...');
    const blob = await response.blob();
    console.log('Blob created, size:', blob.size, 'type:', blob.type);

    console.log('Creating download link element...');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    console.log('Object URL created:', link.href.substring(0, 30) + '...');

    const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.download = finalFilename;
    console.log('Setting download filename to:', finalFilename);

    console.log('Appending link to document body and clicking...');
    document.body.appendChild(link);
    link.click();
    console.log('Link clicked');

    console.log('Cleaning up...');
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    console.log('Download process completed');
  } catch (error) {
    console.error('Error in downloadImage function:', error);
    alert(`Could not download image: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}
