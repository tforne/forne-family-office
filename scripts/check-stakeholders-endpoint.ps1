param(
  [string]$PropertyReference = "AFI-19-00024",
  [int]$Top = 20
)

$ErrorActionPreference = "Stop"

function Get-RepoRoot {
  return Split-Path -Parent $PSScriptRoot
}

function Read-EnvFile {
  param([string]$Path)

  $values = @{}
  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  foreach ($rawLine in Get-Content -LiteralPath $Path) {
    $line = $rawLine.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      continue
    }

    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -lt 1) {
      continue
    }

    $key = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()

    if ($key) {
      $values[$key] = $value
    }
  }

  return $values
}

function Get-ConfigValue {
  param(
    [hashtable]$EnvMap,
    [string]$Name,
    [string]$Fallback = ""
  )

  $runtimeValue = [Environment]::GetEnvironmentVariable($Name)
  if (-not [string]::IsNullOrWhiteSpace($runtimeValue)) {
    return $runtimeValue.Trim()
  }

  if ($EnvMap.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace($EnvMap[$Name])) {
    return $EnvMap[$Name].Trim()
  }

  return $Fallback
}

function Require-ConfigValue {
  param(
    [hashtable]$EnvMap,
    [string]$Name,
    [string]$Fallback = ""
  )

  $value = Get-ConfigValue -EnvMap $EnvMap -Name $Name -Fallback $Fallback
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Falta la variable de entorno $Name."
  }

  return $value
}

function Escape-ODataString {
  param([string]$Value)
  return $Value.Replace("'", "''")
}

function Get-Value {
  param(
    [object]$Record,
    [string[]]$Names
  )

  foreach ($name in $Names) {
    $property = $Record.PSObject.Properties[$name]
    if ($null -ne $property -and -not [string]::IsNullOrWhiteSpace([string]$property.Value)) {
      return [string]$property.Value
    }
  }

  return ""
}

$repoRoot = Get-RepoRoot
$envFile = Join-Path $repoRoot ".env.local"
$envMap = Read-EnvFile -Path $envFile

$tenantId = Require-ConfigValue -EnvMap $envMap -Name "ENTRA_TENANT_ID"
$clientId = Require-ConfigValue -EnvMap $envMap -Name "ENTRA_CLIENT_ID"
$clientSecret = Require-ConfigValue -EnvMap $envMap -Name "ENTRA_CLIENT_SECRET"
$scope = Require-ConfigValue -EnvMap $envMap -Name "BC_SCOPE" -Fallback "https://api.businesscentral.dynamics.com/.default"
$bcBaseUrl = Require-ConfigValue -EnvMap $envMap -Name "BC_BASE_URL"
$bcTenantId = Require-ConfigValue -EnvMap $envMap -Name "BC_TENANT_ID"
$bcEnvironment = Require-ConfigValue -EnvMap $envMap -Name "BC_ENVIRONMENT"
$bcCompanyId = Require-ConfigValue -EnvMap $envMap -Name "BC_COMPANY_ID"
$bcApiPublisher = Require-ConfigValue -EnvMap $envMap -Name "BC_API_PUBLISHER" -Fallback "onedata"
$bcApiGroup = Require-ConfigValue -EnvMap $envMap -Name "BC_API_GROUP" -Fallback "tenantportal"
$bcApiVersion = Require-ConfigValue -EnvMap $envMap -Name "BC_API_VERSION" -Fallback "v1.0"
$stakeholdersEndpoint = Require-ConfigValue -EnvMap $envMap -Name "BC_STAKEHOLDERS_ENDPOINT" -Fallback "portalStakeholdersRich"

$tokenResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    client_id = $clientId
    client_secret = $clientSecret
    scope = $scope
    grant_type = "client_credentials"
  }

$token = $tokenResponse.access_token
$baseEndpoint = "$bcBaseUrl/$bcTenantId/$bcEnvironment/api/$bcApiPublisher/$bcApiGroup/$bcApiVersion/companies($bcCompanyId)/$stakeholdersEndpoint"
$escapedPropertyReference = Escape-ODataString -Value $PropertyReference
$filterUri = "$baseEndpoint?`$filter=propertyNo%20eq%20'$escapedPropertyReference'&`$top=$Top"

$headers = @{
  Authorization = "Bearer $token"
  Accept = "application/json"
}

Write-Host "Endpoint base: $baseEndpoint"
Write-Host "Referencia consultada: $PropertyReference"
Write-Host ""

$responses = @()

try {
  $filteredResponse = Invoke-RestMethod -Method Get -Uri $filterUri -Headers $headers
  $responses += [pscustomobject]@{
    Label = "Filtrado por propertyNo"
    Uri = $filterUri
    Payload = $filteredResponse
  }
} catch {
  Write-Host "Consulta filtrada: ERROR"
  Write-Host $_.Exception.Message
  Write-Host ""
}

try {
  $fallbackUri = "$baseEndpoint?`$top=$Top"
  $fallbackResponse = Invoke-RestMethod -Method Get -Uri $fallbackUri -Headers $headers
  $responses += [pscustomobject]@{
    Label = "Fallback sin filtro"
    Uri = $fallbackUri
    Payload = $fallbackResponse
  }
} catch {
  Write-Host "Consulta fallback: ERROR"
  Write-Host $_.Exception.Message
  Write-Host ""
}

if ($responses.Count -eq 0) {
  throw "No se pudo recuperar ninguna respuesta del endpoint de stakeholders."
}

foreach ($response in $responses) {
  $rows = @($response.Payload.value)

  Write-Host "=== $($response.Label) ==="
  Write-Host "URI: $($response.Uri)"
  Write-Host "Registros recibidos: $($rows.Count)"

  if ($rows.Count -eq 0) {
    Write-Host "Sin registros."
    Write-Host ""
    continue
  }

  $fieldNames = $rows[0].PSObject.Properties.Name | Sort-Object
  Write-Host "Campos detectados:"
  Write-Host ($fieldNames -join ", ")
  Write-Host ""

  $contactRows = foreach ($row in $rows) {
    [pscustomobject]@{
      PropertyNo = Get-Value -Record $row -Names @("propertyNo", "Property No.", "propertyNo.")
      StakeholderNo = Get-Value -Record $row -Names @("stakeholderNo", "Stakeholder No.", "stakeholderNo.")
      StakeholderName = Get-Value -Record $row -Names @("stakeholderName", "name", "displayName", "providerName")
      Phone = Get-Value -Record $row -Names @(
        "phoneNo",
        "Phone No.",
        "phone",
        "telephone",
        "mobilePhoneNo",
        "mobilePhone",
        "contactPhoneNo",
        "contactPhone"
      )
      Email = Get-Value -Record $row -Names @(
        "email",
        "E-Mail",
        "eMail",
        "contactEmail",
        "mail",
        "searchEMail",
        "Search E-Mail"
      )
      PortalVisible = Get-Value -Record $row -Names @("portalVisible", "Portal Visible")
      AvailableForAI = Get-Value -Record $row -Names @("availableForAI", "Available for AI")
    }
  }

  Write-Host "Resumen de contacto:"
  $contactRows | Format-Table -AutoSize
  Write-Host ""
}
