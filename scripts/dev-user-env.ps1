param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

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

foreach ($name in $names) {
  $value = [Environment]::GetEnvironmentVariable($name, "User")
  if (-not [string]::IsNullOrWhiteSpace($value)) {
    Set-Item -Path "Env:$name" -Value $value
  }
}

& ".\node_modules\.bin\next.cmd" dev -p $Port
