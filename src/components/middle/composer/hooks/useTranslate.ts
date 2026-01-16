import type { ApiMessage } from '../../../../api/types';

import { getCachedTranslation, saveCachedTranslation } from '../../../../util/db/translationCache';

export async function translateMessageText(message: ApiMessage,
  targetLanguage: string = 'eng') {
  // Check cache first
  try {
    const cachedTranslation = await getCachedTranslation(message, targetLanguage);
    if (cachedTranslation) {
      return cachedTranslation;
    }
  } catch (err) {
    // Continue to API call if cache fails
  }
  const text = message.content.text?.text;

  const body = JSON.stringify({
    text,
    target_language: targetLanguage,
    glossary: [''],
    model: 'gpt-4o-mini',
  });

  try {
    const response = await fetch(
      'https://tongram-ai-dev.motcaigido.xyz/api/v1/translate-proxy',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ccf38ec98f614ed8a326843fc715b8d1',
        },
        body,
        redirect: 'follow',
      },
    );

    if (!response.ok) {
      return 'Translation unavailable, try again.';
    }

    const data = await response.json();
    const translation = data?.result?.choices[0].message?.content;

    // Cache the translation if successful
    if (translation) {
      try {
        await saveCachedTranslation(message, targetLanguage, translation);
      } catch (err) {
        // Don't fail the whole process if caching fails
      }
    }

    return translation || undefined;
  } catch (err) {
    return undefined;
  }
}
