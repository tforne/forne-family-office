const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPlaceholderSecret(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "pega_aqui_el_secret_nuevo" ||
    normalized === "your-client-secret" ||
    normalized === "client-secret" ||
    normalized.includes("pega_aqui") ||
    normalized.includes("replace")
  );
}

export function assertClientSecretLooksValid(secret: string, variableName: string) {
  const trimmed = secret.trim();

  if (!trimmed) {
    throw new Error(`Falta configuración OAuth: ${variableName}`);
  }

  if (isPlaceholderSecret(trimmed)) {
    throw new Error(
      `${variableName} contiene un valor de ejemplo. Configura el valor real del client secret generado en Azure.`
    );
  }

  if (uuidPattern.test(trimmed)) {
    throw new Error(
      `${variableName} parece ser el Secret ID, no el Secret Value. En Azure debes copiar el campo Value del client secret.`
    );
  }
}

export function explainInvalidClientSecret(status: number, text: string, clientId: string, variableName: string) {
  if (status !== 401 || !text.includes("AADSTS7000215")) {
    return null;
  }

  return [
    `OAuth error ${status}: Microsoft Entra rechazó el client secret para la app ${clientId}.`,
    `Revisa ${variableName} y asegúrate de usar el Secret Value, no el Secret ID.`,
    "Si acabas de cambiar .env.local, reinicia el servidor Next.js para que cargue el nuevo valor."
  ].join(" ");
}
