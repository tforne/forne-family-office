$names = @(
  "USE_DEMO_LOGIN",
  "USE_MOCK_API",
  "APP_BASE_URL",
  "ENTRA_TENANT_ID",
  "ENTRA_CLIENT_ID",
  "ENTRA_CLIENT_SECRET",
  "ENTRA_AUTHORITY",
  "ENTRA_ISSUER",
  "ENTRA_REDIRECT_URI",
  "BC_BASE_URL",
  "BC_TENANT_ID",
  "BC_ENVIRONMENT",
  "BC_COMPANY_ID",
  "BC_SCOPE",
  "BC_API_PUBLISHER",
  "BC_API_GROUP",
  "BC_API_VERSION",
  "BC_PROFILE_USERS_ENDPOINT",
  "BC_PROFILE_USER_EMAIL_FIELD",
  "BC_PROFILE_USER_CUSTOMER_NO_FIELD"
)

function Get-Status {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return "FALTA"
  }

  $normalized = $Value.Trim().ToLowerInvariant()
  if (
    $normalized.Contains("pega_aqui") -or
    $normalized.Contains("replace") -or
    $normalized.Contains("placeholder") -or
    $normalized.Contains("example") -or
    $normalized.Contains("<") -or
    $normalized.Contains(">")
  ) {
    return "REVISAR_PLACEHOLDER"
  }

  return "OK"
}

$rows = foreach ($name in $names) {
  $userValue = [Environment]::GetEnvironmentVariable($name, "User")
  [pscustomobject]@{
    Name = $name
    UserVariable = Get-Status $userValue
  }
}

$rows | Format-Table -AutoSize
