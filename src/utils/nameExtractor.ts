export const extractNameFromDescription = (description: string): string | null => {
  if (!description || typeof description !== 'string') {
    return null;
  }

  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return null;
  }

  // Common patterns for names in descriptions
  // Pattern 1: "Owner: John Smith" or "Name: John Smith" or "For: John Smith"
  const colonPattern = /(?:owner|name|for|belongs to|person):\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i;
  const colonMatch = trimmedDescription.match(colonPattern);
  if (colonMatch && colonMatch[1]) {
    return colonMatch[1].trim();
  }

  // Pattern 2: Just a name at the start of the description
  // Matches "John Smith" or "John" at the beginning
  const startPattern = /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b/;
  const startMatch = trimmedDescription.match(startPattern);
  if (startMatch && startMatch[1]) {
    const potentialName = startMatch[1].trim();
    // Basic validation: name should be 2-50 characters
    if (potentialName.length >= 2 && potentialName.length <= 50) {
      return potentialName;
    }
  }

  // Pattern 3: Name in quotes like "John Smith's collection"
  const quotesPattern = /"([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)"/;
  const quotesMatch = trimmedDescription.match(quotesPattern);
  if (quotesMatch && quotesMatch[1]) {
    return quotesMatch[1].trim();
  }

  return null;
};

export const getInitialsFromName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return 'U';
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return 'U';
  }

  // Split by spaces and get first letter of each word
  const words = trimmedName.split(/\s+/);

  if (words.length === 1) {
    // Single word - return first letter
    return words[0][0].toUpperCase();
  } else {
    // Multiple words - return first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
};

export const getDisplayInitials = (description: string | null | undefined, fallbackName: string = 'U'): string => {
  // Try to extract name from description first
  if (description) {
    const extractedName = extractNameFromDescription(description);
    if (extractedName) {
      return getInitialsFromName(extractedName);
    }
  }

  // Fall back to provided name or default 'U'
  return getInitialsFromName(fallbackName);
};
