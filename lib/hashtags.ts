/**
 * Extracts hashtags from text
 * @param text - The text to extract hashtags from
 * @returns Array of hashtag strings (without the # symbol)
 */
export function extractHashtags(text: string): string[] {
  if (!text) return []

  // Match hashtags: # followed by alphanumeric characters and underscores
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g
  const matches = text.match(hashtagRegex)

  if (!matches) return []

  // Remove duplicates and the # symbol
  const hashtags = matches
    .map(tag => tag.substring(1).toLowerCase())
    .filter((tag, index, arr) => arr.indexOf(tag) === index)

  return hashtags
}

/**
 * Generates automatic tags based on prompt content analysis
 * @param prompt - The video prompt
 * @returns Array of suggested tags
 */
export function generateAutoTags(prompt: string): string[] {
  if (!prompt) return []

  const lowercasePrompt = prompt.toLowerCase()
  const autoTags: string[] = []

  // Style keywords
  const styleKeywords = {
    cinematic: ['cinematic', 'dramatic', 'epic', 'movie'],
    animation: ['animated', 'cartoon', 'anime', '3d animation', '2d animation'],
    realistic: ['realistic', 'photorealistic', 'lifelike', 'real'],
    abstract: ['abstract', 'surreal', 'artistic'],
    vintage: ['vintage', 'retro', 'old', 'classic'],
    futuristic: ['futuristic', 'sci-fi', 'cyberpunk', 'tech'],
    minimalist: ['minimalist', 'simple', 'clean'],
    colorful: ['colorful', 'vibrant', 'bright'],
  }

  // Scene keywords
  const sceneKeywords = {
    nature: ['nature', 'forest', 'mountain', 'ocean', 'beach', 'wildlife'],
    urban: ['city', 'urban', 'street', 'building', 'skyline'],
    space: ['space', 'galaxy', 'planet', 'stars', 'cosmos'],
    underwater: ['underwater', 'ocean', 'sea', 'diving'],
    aerial: ['aerial', 'drone', 'bird eye', 'flying'],
  }

  // Subject keywords
  const subjectKeywords = {
    people: ['person', 'people', 'human', 'man', 'woman', 'child'],
    animals: ['animal', 'dog', 'cat', 'bird', 'lion', 'elephant'],
    vehicle: ['car', 'vehicle', 'train', 'plane', 'bike'],
    architecture: ['building', 'architecture', 'house', 'tower'],
  }

  // Time/mood keywords
  const moodKeywords = {
    sunset: ['sunset', 'sunrise', 'golden hour'],
    night: ['night', 'dark', 'midnight', 'evening'],
    storm: ['storm', 'rain', 'thunder', 'lightning'],
    peaceful: ['peaceful', 'calm', 'serene', 'tranquil'],
    action: ['action', 'fast', 'dynamic', 'motion'],
  }

  // Check all keyword categories
  const allKeywords = {
    ...styleKeywords,
    ...sceneKeywords,
    ...subjectKeywords,
    ...moodKeywords,
  }

  for (const [tag, keywords] of Object.entries(allKeywords)) {
    for (const keyword of keywords) {
      if (lowercasePrompt.includes(keyword)) {
        autoTags.push(tag)
        break // Only add the tag once per category
      }
    }
  }

  return autoTags
}

/**
 * Combines explicit hashtags and auto-generated tags
 * @param prompt - The video prompt
 * @param maxTags - Maximum number of tags to return (default: 10)
 * @returns Array of combined tags
 */
export function extractAndGenerateTags(
  prompt: string,
  maxTags: number = 10
): string[] {
  const explicitHashtags = extractHashtags(prompt)
  const autoTags = generateAutoTags(prompt)

  // Combine both, prioritizing explicit hashtags
  const combined = [...explicitHashtags, ...autoTags]

  // Remove duplicates and limit to maxTags
  const uniqueTags = combined.filter(
    (tag, index, arr) => arr.indexOf(tag) === index
  )

  return uniqueTags.slice(0, maxTags)
}

/**
 * Validates a hashtag
 * @param tag - The hashtag to validate
 * @returns true if valid, false otherwise
 */
export function isValidHashtag(tag: string): boolean {
  if (!tag || tag.length === 0) return false
  if (tag.length > 50) return false // Max length

  // Only alphanumeric and underscores
  const validPattern = /^[a-zA-Z0-9_]+$/
  return validPattern.test(tag)
}

/**
 * Formats tags for display
 * @param tags - Array of tags
 * @returns Array of formatted tags with # prefix
 */
export function formatTagsForDisplay(tags: string[]): string[] {
  return tags.map(tag => `#${tag}`)
}

/**
 * Removes hashtags from text
 * @param text - The text to process
 * @returns Text without hashtags
 */
export function removeHashtags(text: string): string {
  return text.replace(/#([a-zA-Z0-9_]+)/g, '').trim()
}

/**
 * Gets trending hashtags from the database
 * This would typically query the database for most used tags
 */
export async function getTrendingHashtags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
  // This is a placeholder - implement with actual database query
  // For now, return empty array
  return []
}
