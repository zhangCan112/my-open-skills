#run-smoke.ps1 — regression for the generate side (Phase 3 step 2)
#Usage: powershell -ExecutionPolicy Bypass -File ./run-smoke.ps1
#Exit: 0 = all 5 expected findings detected for the fixtures
#      1 = at least one expected finding is no longer surfaced by the templates
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$coreL = Get-Content -Raw (Join-Path $here 'fixtures/adapter/legacy/adapter_core.py')
$coreT = Get-Content -Raw (Join-Path $here 'fixtures/adapter/target/adapter_core.py')
$glueL = Get-Content -Raw (Join-Path $here 'fixtures/adapter/legacy/app_a/glue_a.py')
$glueT = Get-Content -Raw (Join-Path $here 'fixtures/adapter/target/app_b/glue_b.py')

function Test-Finding([string]$id, [scriptblock]$check) {
    $pass = (& $check) -eq $true
    Write-Host ("{0,-6} {1}" -f ($(if ($pass) { 'PASS' } else { 'FAIL' })), $id)
    return $pass
}

$checks = @(
    , @('F1 adapter core re-hosted: seam re-pointed A->B (PROVIDER_SOURCE), pure logic preserved',
        { ($coreL -match 'PROVIDER_SOURCE\s*=\s*"A:ATLAS_FX"') -and ($coreT -match 'PROVIDER_SOURCE\s*=\s*"B:ORB_FX"') -and ($coreT -notmatch 'PROVIDER_SOURCE\s*=\s*"A:ATLAS_FX"') -and ($coreL -match 'normalize_currency') -and ($coreT -match 'normalize_currency') })
    , @('F2 host glue rewired to host B rules (oracle = B, not legacy A)',
        { ($glueL -match 'ATLAS_MODE') -and ($glueL -match '"error"') -and ($glueT -match 'ORB_SECTION') -and ($glueT -match 'reason') -and ($glueT -notmatch 'ATLAS_MODE') })
    , @('F3 legacy-A residue leaked into host B glue',
        { ($glueL -match 'ATLAS') -and ($glueT -match 'ATLAS') })
    , @('F4 host-B-only requirement MISSING (emit_metric never called in B glue)',
        { ($glueT -match 'REQUIRED') -and (-not ($glueT -match 'emit_metric\(')) })
    , @('F5 ordering guarantee silently delegated to B provider (sorted(raw) -> list(raw))',
        { ($coreL -match 'return sorted\(raw\)') -and ($coreT -match 'return list\(raw\)') -and (-not ($coreT -match 'sorted\(')) })
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
