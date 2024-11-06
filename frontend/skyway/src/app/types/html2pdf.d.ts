// src/types/html2pdf.d.ts

declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: { 
        type?: string; 
        quality?: number 
      };
      html2canvas?: { 
        scale?: number;
        [key: string]: any;
      };
      jsPDF?: { 
        unit?: string; 
        format?: string; 
        orientation?: 'portrait' | 'landscape';
        [key: string]: any;
      };
    }
  
    interface Html2PdfWrapper {
      from(element: HTMLElement | string): Html2PdfWrapper;
      set(options: Html2PdfOptions): Html2PdfWrapper;
      save(): Promise<void>;
      output(type: string, options?: any): Promise<any>;
    }
  
    function html2pdf(): Html2PdfWrapper;
    function html2pdf(element: HTMLElement | string, opts?: Html2PdfOptions): Promise<void>;
  
    export default html2pdf;
  }