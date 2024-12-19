import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { useGet } from '../../../hooks/useGet';

const DatasheetSearch = ({ productIdentifier, manName, aka = [], upc = [] }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const { getData } = useGet();

  // Function to check if a string is numeric only
  const isNumeric = (str) => /^\d+$/.test(str);

  // Function to validate keyword length (3+ chars unless numeric)
  const isValidKeyword = (keyword) => {
    if (!keyword) return false;
    return isNumeric(keyword) || keyword.length >= 3;
  };

  // Function to normalize text while keeping track of original positions
  const normalizeText = (text) => {
    if (!text) return { normalized: '', positions: [] };

    const positions = [];
    let normalized = '';
    let normalizedIndex = 0;

    const lowerText = text.toLowerCase();

    for (let i = 0; i < lowerText.length; i++) {
      const char = lowerText[i];
      if (/[a-z0-9\s]/.test(char)) {
        if (char === ' ') {
          if (normalized.length === 0 || normalized[normalized.length - 1] !== ' ') {
            normalized += ' ';
            positions[normalizedIndex] = i;
            normalizedIndex++;
          }
        } else {
          normalized += char;
          positions[normalizedIndex] = i;
          normalizedIndex++;
        }
      } else {
        if (normalized.length === 0 || normalized[normalized.length - 1] !== ' ') {
          normalized += ' ';
          positions[normalizedIndex] = i;
          normalizedIndex++;
        }
      }
    }

    normalized = normalized.trim();
    const firstNonSpace = normalized.length - normalized.trimLeft().length;
    const lastNonSpace = normalized.length - normalized.trimRight().length;
    positions.splice(normalized.length - lastNonSpace);
    positions.splice(0, firstNonSpace);

    return { normalized, positions };
  };

  // Function to create keyword buckets from search terms
  const createKeywordBuckets = () => {
    const buckets = {
      upc: upc.flatMap((u) => normalizeText(u).normalized.split(' ')).filter((term) => isValidKeyword(term)),
      aka: aka.flatMap((a) => normalizeText(a).normalized.split(' ')).filter((term) => isValidKeyword(term)),
      productId: normalizeText(productIdentifier)
        .normalized.split(' ')
        .filter((term) => isValidKeyword(term)),
      manName: normalizeText(manName)
        .normalized.split(' ')
        .filter((term) => isValidKeyword(term)),
    };
    return buckets;
  };

  // Function to find all matches with their positions and types
  const findMatches = (text) => {
    const { normalized: normalizedText, positions } = normalizeText(text);
    const buckets = createKeywordBuckets();
    const matches = [];

    const keywordTypes = [
      { type: 'upc', color: '#ffcccc', keywords: buckets.upc },
      { type: 'aka', color: '#ffe6cc', keywords: buckets.aka },
      { type: 'productId', color: '#fff3cd', keywords: buckets.productId },
      { type: 'manName', color: '#cce5ff', keywords: buckets.manName },
    ];

    keywordTypes.forEach(({ type, color, keywords }) => {
      keywords.forEach((keyword) => {
        let startIndex = 0;
        while (true) {
          const index = normalizedText.indexOf(keyword, startIndex);
          if (index === -1) break;

          const originalStart = positions[index];
          const originalEnd = positions[index + keyword.length - 1] + 1;

          if (originalStart !== undefined && originalEnd !== undefined) {
            matches.push({
              start: originalStart,
              end: originalEnd,
              type,
              color,
              priority: keywordTypes.findIndex((kt) => kt.type === type),
            });
          }
          startIndex = index + 1;
        }
      });
    });

    return matches;
  };

  // Function to highlight text with overlapping priorities
  const highlightText = (text) => {
    if (!text) return text;

    const matches = findMatches(text);
    if (matches.length === 0) return text;

    // Sort matches by start position and priority
    matches.sort((a, b) => {
      if (a.start === b.start) return a.priority - b.priority;
      return a.start - b.start;
    });

    // Merge overlapping matches keeping higher priority ones
    const mergedMatches = [];
    let currentMatch = matches[0];

    for (let i = 1; i < matches.length; i++) {
      const nextMatch = matches[i];
      if (currentMatch.end >= nextMatch.start) {
        // Overlapping matches - keep the higher priority one
        if (nextMatch.priority < currentMatch.priority) {
          currentMatch = {
            start: Math.min(currentMatch.start, nextMatch.start),
            end: Math.max(currentMatch.end, nextMatch.end),
            type: nextMatch.type,
            color: nextMatch.color,
            priority: nextMatch.priority,
          };
        } else {
          currentMatch.end = Math.max(currentMatch.end, nextMatch.end);
        }
      } else {
        mergedMatches.push(currentMatch);
        currentMatch = nextMatch;
      }
    }
    mergedMatches.push(currentMatch);

    // Build highlighted text
    let result = [];
    let lastIndex = 0;

    mergedMatches.forEach((match, index) => {
      if (match.start > lastIndex) {
        result.push(text.slice(lastIndex, match.start));
      }
      result.push(
        <span key={`highlight-${index}`} style={{ backgroundColor: match.color }}>
          {text.slice(match.start, match.end)}
        </span>
      );
      lastIndex = match.end;
    });

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  useEffect(() => {
    const searchDatasheets = async () => {
      if (!productIdentifier && !manName && aka.length === 0 && upc.length === 0) return;

      setIsSearching(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          ...(productIdentifier && { productIdentifier }),
          ...(manName && { manName }),
          ...(aka.length > 0 && { aka: aka.join(',') }),
          ...(upc.length > 0 && { upc: upc.join(',') }),
        });

        const response = await getData(`/fulfill/datasheets/search?${queryParams}`);
        setSearchResults(response.matches || []);
      } catch (err) {
        // console.error('Error searching datasheets:', err);
        setError(err.message || 'Failed to search datasheets');
      } finally {
        setIsSearching(false);
      }
    };

    searchDatasheets();
  }, [productIdentifier, manName, aka, upc, getData]);

  if (isSearching) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" role="status" size="sm" className="me-2" />
          Searching datasheets...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body className="text-danger">Error: {error}</Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Datasheet Matches</span>
        <Badge bg="primary">{searchResults.length}</Badge>
      </Card.Header>
      <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {searchResults.length === 0 ? (
          <ListGroup.Item className="text-muted">No matching datasheets found</ListGroup.Item>
        ) : (
          searchResults.map((datasheet) => (
            <ListGroup.Item key={datasheet._id} className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-2">
                    <strong>{highlightText(datasheet.productIdentifier)}</strong>
                    {datasheet.source?.trustedSource && (
                      <Badge bg="success" className="text-uppercase" style={{ fontSize: '0.7em' }}>
                        M
                      </Badge>
                    )}
                    {datasheet.duplicateResults > 0 && (
                      <Badge bg="info" style={{ fontSize: '0.7em' }}>
                        +{datasheet.duplicateResults} dup
                      </Badge>
                    )}
                    {datasheet.treeSize > 1 && (
                      <Badge bg="warning" text="dark" style={{ fontSize: '0.7em' }}>
                        +{datasheet.treeSize - 1} rev
                      </Badge>
                    )}
                    {datasheet.clientCount > 0 && (
                      <Badge bg="primary" style={{ fontSize: '0.7em' }}>
                        {datasheet.clientCount} client{datasheet.clientCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <small className="text-muted">{datasheet.sdsDate ? new Date(datasheet.sdsDate).toLocaleDateString() : 'No date'}</small>
                </div>
                <Badge bg="secondary" title="Match Score">
                  {datasheet.score.toFixed(2)}
                </Badge>
              </div>
              <div>{highlightText(datasheet.manName)}</div>
              {datasheet.aka?.length > 0 && <small className="text-muted">Alt: {highlightText(datasheet.aka.join(', '))}</small>}
              {datasheet.upc?.length > 0 && <small className="text-muted">UPC: {highlightText(datasheet.upc.join(', '))}</small>}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
};

export default DatasheetSearch;
