# Alias runner for mobile client
param([switch]$Tunnel, [switch]$Clear, [string]$Ip)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $ScriptDir "run_mobile.ps1") @PSBoundParameters
