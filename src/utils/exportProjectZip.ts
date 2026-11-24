export async function downloadProjectZip(): Promise<number> {
  const [{ default: JSZip }, { default: projectFiles }] = await Promise.all([
    import('jszip'),
    import('virtual:project-files'),
  ]);

  const zip = new JSZip();
  const entries = Object.entries(projectFiles);

  for (const [filePath, content] of entries) {
    zip.file(filePath, content);
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'relief-crops-farm-sim.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 4000);

  return entries.length;
}
