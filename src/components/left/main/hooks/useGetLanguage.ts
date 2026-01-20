export async function loadLanguages() {
  try {
    const response = await fetch(
      'https://tongram-ai-dev.motcaigido.xyz/api/v1/list-languages',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ccf38ec98f614ed8a326843fc715b8d1',
        },
        redirect: 'follow',
      },
    );

    if (!response.ok) {
      return 'Translation unavailable, try again.';
    }

    const languages = await response.json();

    return languages || undefined;
  } catch (err) {
    return undefined;
  }
}
