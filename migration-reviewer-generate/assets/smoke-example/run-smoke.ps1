#run-smoke.ps1 — regression for the generate side (Phase 3 step 2)
#Usage: powershell -ExecutionPolicy Bypass -File ./run-smoke.ps1
#Exit: 0 = all 5 expected findings detected for the fixtures
#      1 = at least one expected finding is no longer surfaced by the templates
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$legacy = Get-Content -Raw (Join-Path $here 'fixtures/legacy/calculate_fee.py')
$target = Get-Content -Raw (Join-Path $here 'fixtures/svc/payments/fee.go')

function Test-Finding([string]$id, [scriptblock]$check) {
    $pass = (& $check) -eq $true
    Write-Host ("{0,-6} {1}" -f ($(if ($pass) { 'PASS' } else { 'FAIL' })), $id)
    return $pass
}

$checks = @(
    , @('F1 MISSING apply_coupon()',
        { ($legacy -match 'def apply_coupon') -and (-not ($target -match 'apply\s*Coupon|apply_coupon')) })
    , @('F2 DIFFERS rounding (ROUND_HALF_UP -> math.Round)',
        { ($legacy -match 'ROUND_HALF_UP') -and ($target -match 'math\.Round') })
    , @('F3 DIFFERS error surface (ValueError -> fmt.Errorf)',
        { ($legacy -match 'ValueError') -and ($target -match 'fmt\.Errorf') })
    , @('F4 DIFFERS audit text (repr amount -> %.2f)',
        { ($legacy -match 'amount=\{amount\}') -and ($target -match 'amount=%\.2f') })
    , @('F5 DIFFERS numeric semantics (Decimal vs float64)',
        { ($legacy -match 'Decimal\(str') -and ($target -match 'float64') })
)

$results = @();
foreach ($c in $checks) { $results += Test-Finding $c[0] $c[1] }

$failed = @($results | Where-Object { $_ -eq $false }).Count
Write-Host ""
Write-Host "Expected findings detected: $($results.Count - $failed)/$($results.Count)"
if ($failed -gt 0) {
    Write-Host "Regression detected: $failed expected finding(s) no longer surfaced. Check templates/checklist changes." -ForegroundColor Red
    exit 1
}
Write-Host "Smoke passed: all expected findings still surfaced by the generated artifact." -ForegroundColor Green
exit 0