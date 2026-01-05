import {
  clearAllCachedTranslations,
  clearOldCachedTranslations,
  getCachedTranslation,
  getCacheStatistics,
  saveCachedTranslation,
} from '../db/translationCache';

/**
 * Example 1: Check if a translation exists in cache
 */
export async function checkTranslationInCache() {
  const textToTranslate = 'Hello, how are you?';
  const targetLanguage = 'spa'; // Spanish

  try {
    const cachedTranslation = await getCachedTranslation(textToTranslate, targetLanguage);

    if (cachedTranslation) {
      return cachedTranslation;
    } else {
      console.log('No cached translation found, will need to fetch from API');
    }
  } catch (error) {
    console.error('Error checking cache:', error);
  }
}

/**
 * Example 2: Save a translation manually to cache
 */
export async function saveTranslationToCache() {
  const originalText = 'Good morning!';
  const targetLanguage = 'fra'; // French
  const translation = 'Bonjour!';

  try {
    await saveCachedTranslation(originalText, targetLanguage, translation);
    console.log('Translation saved to cache successfully');
  } catch (error) {
    console.error('Error saving translation to cache:', error);
  }
}

/**
 * Example 3: Clear all cached translations (for cleanup or storage management)
 */
export async function clearAllTranslationCache() {
  try {
    await clearAllCachedTranslations();
    console.log('All cached translations have been cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Example 4: Clear old cached translations (older than 30 days)
 */
export async function cleanupOldTranslations() {
  try {
    await clearOldCachedTranslations(30); // Clear translations older than 30 days
    console.log('Old cached translations have been cleared');
  } catch (error) {
    console.error('Error cleaning up old translations:', error);
  }
}

/**
 * Example 5: Get cache statistics
 */
export async function displayCacheStats() {
  try {
    const stats = await getCacheStatistics();
    console.log(`Cache Statistics:
      - Total entries: ${stats.count}
      - Estimated size: ${(stats.size / 1024).toFixed(2)} KB
    `);
    return stats;
  } catch (error) {
    console.error('Error getting cache statistics:', error);
  }
}

/**
 * Example 6: Typical workflow with cache
 *
 * This is how the translateMessageText function uses the cache internally:
 * 1. Check if translation exists in cache
 * 2. If cached, return immediately
 * 3. If not cached, call the API
 * 4. Save the result to cache for future use
 */
export async function typicalTranslationWorkflow(
  textToTranslate: string,
  targetLanguage: string = 'eng',
) {
  // Step 1: Check cache
  const cachedTranslation = await getCachedTranslation(textToTranslate, targetLanguage);
  if (cachedTranslation) {
    console.log('Using cached translation:', cachedTranslation);
    return cachedTranslation;
  }

  // Step 2: Fetch from API
  console.log('Fetching translation from API...');
  const apiTranslation = await callTranslationAPI(textToTranslate, targetLanguage);

  if (apiTranslation) {
    // Step 3: Save to cache
    await saveCachedTranslation(textToTranslate, targetLanguage, apiTranslation);
    console.log('Translation saved to cache');
  }

  return apiTranslation;
}

/**
 * Dummy API call function (replace with actual implementation)
 */
async function callTranslationAPI(
  text: string,
  targetLanguage: string,
): Promise<string | undefined> {
  // Implementation would go here
  return undefined;
}
