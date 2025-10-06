# PowerShell script to pull data from live Strapi instance
# This reads the token from .env file automatically

# Load .env file
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#].+?)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
} else {
    Write-Error ".env file not found!"
    exit 1
}

# Check if required variables are set
if (-not $env:STRAPI_LIVE_URL -or -not $env:STRAPI_LIVE_TOKEN) {
    Write-Error "STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN must be set in .env file"
    exit 1
}

# Run the transfer command
Write-Host "Pulling data from: $env:STRAPI_LIVE_URL"
npm run pull-live

