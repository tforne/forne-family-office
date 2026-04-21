param(
  [string]$AppBaseUrl = "http://localhost:3000",
  [string]$EntraRedirectUri = "$AppBaseUrl/api/auth/callback"
)

$ErrorActionPreference = "Stop"

function Set-UserVariable {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  [Environment]::SetEnvironmentVariable($Name, $Value, "User")
}

function Read-RequiredValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [switch]$Secret
  )

  do {
    if ($Secret) {
      $secure = Read-Host "$Name" -AsSecureString
      $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
      try {
        $value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
      } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
      }
    } else {
      $value = Read-Host "$Name"
    }

    if ([string]::IsNullOrWhiteSpace($value)) {
      Write-Host "El valor de $Name no puede estar vacio." -ForegroundColor Yellow
    }
  } while ([string]::IsNullOrWhiteSpace($value))

  return $value.Trim()
}

Write-Host "Configurando variables de usuario de Windows para Forne Family Office..." -ForegroundColor Cyan
Write-Host "Los valores se guardaran en tu usuario de Windows y no se escribiran en Git." -ForegroundColor Cyan
Write-Host ""

$entraTenantId = Read-RequiredValue "ENTRA_TENANT_ID"
$entraClientId = Read-RequiredValue "ENTRA_CLIENT_ID"
$entraClientSecret = Read-RequiredValue "ENTRA_CLIENT_SECRET (pega el Value del secret, no el Secret ID)" -Secret
$bcCompanyId = Read-RequiredValue "BC_COMPANY_ID"

$values = @{
  USE_DEMO_LOGIN = "false"
  USE_MOCK_API = "false"
  APP_BASE_URL = $AppBaseUrl
  ENTRA_TENANT_ID = $entraTenantId
  ENTRA_CLIENT_ID = $entraClientId
  ENTRA_CLIENT_SECRET = $entraClientSecret
  ENTRA_AUTHORITY = "https://login.microsoftonline.com/$entraTenantId"
  ENTRA_ISSUER = "https://login.microsoftonline.com/$entraTenantId/v2.0"
  ENTRA_REDIRECT_URI = $EntraRedirectUri
  BC_BASE_URL = "https://api.businesscentral.dynamics.com/v2.0"
  BC_TENANT_ID = $entraTenantId
  BC_ENVIRONMENT = "Production"
  BC_COMPANY_ID = $bcCompanyId
  BC_SCOPE = "https://api.businesscentral.dynamics.com/.default"
  BC_API_PUBLISHER = "onedata"
  BC_API_GROUP = "tenantportal"
  BC_API_VERSION = "v1.0"
  BC_PROFILE_USERS_ENDPOINT = "tenantPortalUsers"
  BC_PROFILE_USER_EMAIL_FIELD = "email"
  BC_PROFILE_USER_CUSTOMER_NO_FIELD = "customerNo"
}

foreach ($entry in $values.GetEnumerator()) {
  Set-UserVariable -Name $entry.Key -Value $entry.Value
}

Write-Host ""
Write-Host "Variables guardadas correctamente." -ForegroundColor Green
Write-Host "Cierra y vuelve a abrir la terminal antes de ejecutar npm run dev." -ForegroundColor Yellow
