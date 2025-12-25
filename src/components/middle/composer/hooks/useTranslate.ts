export async function translateMessageText(text: string,
  targetLanguage: string = 'eng') {
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
        },
        body,
        redirect: 'follow',
      },
    );

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    const translation = data?.result?.choices[0].message?.content;
    return translation || undefined;
  } catch (err) {
    return undefined;
  }
}
