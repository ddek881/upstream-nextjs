// Utility functions for text processing

export function truncateText(text: string, maxWords: number = 30): string {
  if (!text) return ''
  
  const words = text.split(' ')
  if (words.length <= maxWords) {
    return text
  }
  
  return words.slice(0, maxWords).join(' ') + '...'
}

export function truncateTextByChars(text: string, maxChars: number = 30): string {
  if (!text) return ''
  
  if (text.length <= maxChars) {
    return text
  }
  
  return text.substring(0, maxChars) + '...'
}

export function stripHtmlTags(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

export function truncateHtml(html: string, maxChars: number = 30): string {
  if (!html) return ''
  
  // Replace &nbsp; with regular spaces
  let plainText = html.replace(/&nbsp;/g, ' ')
  
  // Strip HTML tags and add spaces between words
  plainText = plainText.replace(/<[^>]*>/g, ' ')
  
  // Clean up extra whitespace
  plainText = plainText.replace(/\s+/g, ' ').trim()
  
  return truncateTextByChars(plainText, maxChars)
}

export function renderHtml(html: string): { __html: string } {
  return { __html: html || '' }
}


