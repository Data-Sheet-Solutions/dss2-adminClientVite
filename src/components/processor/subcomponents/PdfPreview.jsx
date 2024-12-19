import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Form } from 'react-bootstrap';
import { useGet } from '../../../hooks/useGet';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Try to use the module worker first, fallback to the copied file
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
} catch (error) {
  // Fallback to the copied worker file in public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

// Adjustment factors for fine-tuning text layer alignment
const HORIZONTAL_SCALE = 0.98; // 0.98
const VERTICAL_SCALE = 0.98; // .98
const VERTICAL_OFFSET = -0.035; // -0.035
const LETTER_SPACING = 0; // 0

const PdfPreview = ({ fileHash, searchTerms = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [useNativeEmbed, setUseNativeEmbed] = useState(false);
  const [base64Pdf, setBase64Pdf] = useState(''); // State to hold base64 encoded PDF
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const { getData } = useGet();
  const [containerHeight, setContainerHeight] = useState('auto'); // State to manage container height

  // Function to normalize text for comparison
  const normalizeText = (text) => {
    return (
      text
        ?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || ''
    );
  };

  // Function to check if a word appears in a text as a complete word
  const hasCompleteWord = (text, word) => {
    if (!text || !word) return false;
    const normalizedText = ` ${normalizeText(text)} `;
    const normalizedWord = ` ${normalizeText(word)} `;
    return normalizedText.includes(normalizedWord);
  };

  // Function to highlight text in the text layer
  const highlightText = (textContent, searchTerms, viewport) => {
    if (!textLayerRef.current) return;

    const textItems = textContent.items;
    const textLayer = textLayerRef.current;
    textLayer.innerHTML = '';

    // Set text layer dimensions to match viewport exactly
    Object.assign(textLayer.style, {
      width: `${Math.floor(viewport.width)}px`,
      height: `${Math.floor(viewport.height)}px`,
      position: 'absolute',
      top: '0',
      left: '0',
      mixBlendMode: 'multiply',
    });

    // Prepare search terms by splitting into words
    const terms = {
      productIdentifier: {
        text: searchTerms.productIdentifier ? normalizeText(searchTerms.productIdentifier).split(' ') : [],
        color: 'rgb(255 221 115)', // Light yellow
      },
      manName: {
        text: searchTerms.manName ? normalizeText(searchTerms.manName).split(' ') : [],
        color: 'rgba(204, 229, 255, 0.7)', // Light blue
      },
      aka:
        searchTerms.aka?.map((term) => ({
          text: normalizeText(term).split(' '),
          color: 'rgb(166, 255, 158)', // Light orange
        })) || [],
    };

    // Sort text items by their vertical position (top to bottom)
    const sortedItems = [...textItems].sort((a, b) => b.transform[5] - a.transform[5]);

    sortedItems.forEach((item) => {
      const itemText = item.str;
      const normalizedItemText = normalizeText(itemText);

      // Create outer text element
      const span = document.createElement('span');
      span.style.position = 'absolute';
      span.style.whiteSpace = 'pre';
      span.textContent = itemText;

      // Get text dimensions from the transform matrix
      const [scaleX, skewY, skewX, scaleY, translateX, translateY] = item.transform;

      // Calculate position and dimensions using separate scaling factors
      const x = translateX * viewport.scale * HORIZONTAL_SCALE;
      const y = viewport.height - translateY * viewport.scale * VERTICAL_SCALE + viewport.height * VERTICAL_OFFSET;
      const fontSize = Math.sqrt(scaleX * scaleX + skewX * skewX) * viewport.scale * HORIZONTAL_SCALE;
      const letterSpacing = fontSize * LETTER_SPACING;
      const rotation = Math.atan2(skewY, scaleX) * (180 / Math.PI);

      // Apply styles with scaled values
      Object.assign(span.style, {
        left: `${x}px`,
        top: `${y}px`,
        fontSize: `${fontSize}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'left bottom',
        display: 'inline-block',
        lineHeight: '1.0',
        letterSpacing: `${letterSpacing}px`,
      });

      // Check for matches and create nested spans for highlights
      let matched = false;

      // Check productIdentifier words
      if (!matched && terms.productIdentifier.text.length > 0) {
        terms.productIdentifier.text.forEach((word) => {
          if (word.length >= 3 && hasCompleteWord(normalizedItemText, word)) {
            const highlightSpan = document.createElement('span');
            highlightSpan.style.backgroundColor = terms.productIdentifier.color;
            highlightSpan.textContent = word; // Highlight only the matched word
            span.innerHTML = span.innerHTML.replace(new RegExp(`(${word})`, 'gi'), highlightSpan.outerHTML);
            matched = true;
          }
        });
      }

      // Check manName words
      if (!matched && terms.manName.text.length > 0) {
        terms.manName.text.forEach((word) => {
          if (word.length >= 3 && hasCompleteWord(normalizedItemText, word)) {
            const highlightSpan = document.createElement('span');
            highlightSpan.style.backgroundColor = terms.manName.color;
            highlightSpan.textContent = word; // Highlight only the matched word
            span.innerHTML = span.innerHTML.replace(new RegExp(`(${word})`, 'gi'), highlightSpan.outerHTML);
            matched = true;
          }
        });
      }

      // Check aka terms
      if (!matched) {
        for (const akaTerm of terms.aka) {
          akaTerm.text.forEach((word) => {
            if (word.length >= 3 && hasCompleteWord(normalizedItemText, word)) {
              const highlightSpan = document.createElement('span');
              highlightSpan.style.backgroundColor = akaTerm.color;
              highlightSpan.textContent = word; // Highlight only the matched word
              span.innerHTML = span.innerHTML.replace(new RegExp(`(${word})`, 'gi'), highlightSpan.outerHTML);
              matched = true;
            }
          });
        }
      }

      textLayer.appendChild(span);
    });
  };

  // Effect to load the PDF document
  useEffect(() => {
    const loadPdfDocument = async () => {
      if (!fileHash) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get the PDF data as an array buffer
        const response = await getData(`/sds/${fileHash}`, null, {
          responseType: 'arraybuffer',
          transformResponse: [], // Prevent axios from trying to transform the response
        });

        // Check if we received data
        if (!response?.data) {
          throw new Error('Received empty PDF data');
        }

        // Convert array buffer to base64
        const base64String = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        setBase64Pdf(`data:application/pdf;base64,${base64String}`); // Set base64 PDF

        // Load the PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument({
          data: response.data,
          verbosity: pdfjsLib.VerbosityLevel.ERRORS,
        });

        const pdf = await loadingTask.promise;

        // Verify we got a valid PDF
        if (!pdf || pdf.numPages === 0) {
          throw new Error('Invalid PDF document');
        }

        setPdfDocument(pdf);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(err.message || 'Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    loadPdfDocument();
  }, [fileHash, getData]);

  // Effect to render the PDF page
  useEffect(() => {
    let isMounted = true; // Track if the component is mounted
    let isRendering = false; // Track if a render operation is in progress

    const renderPage = async () => {
      // Ensure all necessary references are available
      if (!pdfDocument || !containerRef.current || !canvasRef.current || !textLayerRef.current) {
        console.error('Required references are not available for rendering.');
        return; // Early return if any reference is missing
      }

      if (isRendering) return; // Prevent overlapping render calls
      isRendering = true; // Set rendering flag

      try {
        // Get the first page
        const page = await pdfDocument.getPage(1); // Ensure we retrieve the page here

        // Check if containerRef.current is valid before accessing clientWidth
        if (!containerRef.current) {
          console.error('Container reference is null');
          return; // Early return if the reference is null
        }

        // Calculate scale to fit width while maintaining aspect ratio
        const containerWidth = containerRef.current.clientWidth;
        if (!containerWidth) {
          console.error('Container width is not available.');
          return; // Early return if container width is not valid
        }
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        // Set up canvas
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render PDF page
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        // Get text content and highlight
        const textContent = await page.getTextContent();
        highlightText(textContent, searchTerms, scaledViewport);
      } catch (err) {
        console.error('Error rendering PDF page:', err);
        if (isMounted) setError(err.message || 'Failed to render PDF');
      } finally {
        isRendering = false; // Reset rendering flag after completion
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (isMounted) {
        renderPage(); // Re-render the page on resize
      }
    });

    // Ensure the container is available before observing
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current); // Observe the container
    }

    renderPage(); // Initial render

    return () => {
      isMounted = false; // Cleanup function to prevent state updates if unmounted
      resizeObserver.disconnect(); // Stop observing on cleanup
    };
  }, [pdfDocument, searchTerms]);

  // Effect to handle container height adjustment
  useEffect(() => {
    if (useNativeEmbed) {
      const letterWidth = 100; // Width in percentage
      const letterHeight = 0.75 * letterWidth; // Calculate height based on aspect ratio
      setContainerHeight(`${letterHeight}vw`); // Set height in vw for responsive design
    } else {
      setContainerHeight('auto'); // Reset height when not in native view
    }
  }, [useNativeEmbed]);

  if (isLoading) {
    return (
      <Card className="h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading PDF...</span>
        </Spinner>
      </Card>
    );
  }

  if (error) {
    return <Card className="h-100 d-flex justify-content-center align-items-center text-danger">Error: {error}</Card>;
  }

  return (
    <Card className="h-100">
      <Card.Body className="p-0 position-relative" ref={containerRef} style={{ height: containerHeight }}>
        {useNativeEmbed ? (
          <embed
            src={base64Pdf} // Use base64 encoded PDF
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ display: 'block' }}
          />
        ) : (
          <>
            <canvas ref={canvasRef} className="w-100" style={{ display: 'block', visibility: 'hidden' }} />
            <div
              ref={textLayerRef}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                overflow: 'hidden',
                backgroundColor: 'white',
              }}
            />
          </>
        )}
      </Card.Body>
      <Card.Footer>
        <Form>
          <Form.Check
            type="switch"
            id="render-mode-switch"
            label="Use Native PDF Embed"
            checked={useNativeEmbed}
            onChange={() => setUseNativeEmbed(!useNativeEmbed)}
          />
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default PdfPreview;
