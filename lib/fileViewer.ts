/**
 * Universal File Preview & Download Utility for FinSoCap Dashboard
 */

export function downloadFile(urlOrContent?: string, fileName: string = "document.pdf", customBodyText?: string) {
  if (typeof window === "undefined") return;

  // 1. Handle base64 Data URLs (e.g. data:application/pdf;base64,...)
  if (urlOrContent && urlOrContent.startsWith("data:")) {
    try {
      const parts = urlOrContent.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return;
    } catch (e) {
      console.error("[downloadFile] Failed to decode base64 data URL, falling back to direct anchor:", e);
    }
  }

  // 2. If it is a real URL (starts with /api, http, blob:)
  if (urlOrContent && (
    urlOrContent.startsWith("http") || 
    urlOrContent.startsWith("/api") || 
    urlOrContent.startsWith("blob:")
  )) {
    const link = document.createElement("a");
    link.href = urlOrContent;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 2. Otherwise generate a realistic official PDF dummy blob for simulation/preview
  const textLine = customBodyText ? customBodyText.replace(/[\r\n]+/g, " -- ") : "Status: Digitally Verified";
  const content = `%PDF-1.4
%
1 0 obj
<<
/Title (${fileName})
/Creator (FinSoCap Enterprise Platform)
/Producer (FinSoCap PDF Engine)
/CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}Z)
>>
endobj
2 0 obj
<<
/Type /Catalog
/Pages 3 0 R
>>
endobj
3 0 obj
<<
/Type /Pages
/Kids [4 0 R]
/Count 1
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 3 0 R
/MediaBox [0 0 612 792]
/Contents 5 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
5 0 obj
<<
/Length 240
>>
stream
BT
/F1 18 Tf
50 720 Td
(FINSOCAP COMPLIANCE DOCUMENT) Tj
/F1 12 Tf
0 -30 Td
(Document Name: ${fileName}) Tj
0 -20 Td
(Generated On: ${new Date().toLocaleString()}) Tj
0 -20 Td
(${textLine.slice(0, 60)}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000160 00000 n 
0000000213 00000 n 
0000000270 00000 n 
0000000450 00000 n 
trailer
<<
/Size 6
/Root 2 0 R
/Info 1 0 R
>>
startxref
720
%%EOF`;

  const blob = new Blob([content], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName.endsWith(".pdf") || fileName.endsWith(".png") || fileName.endsWith(".jpg") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}
