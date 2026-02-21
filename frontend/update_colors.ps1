$f = 'd:\html\Digital Library SYSTEM\frontend\src\components\landing\LandingPage.jsx'
$c = Get-Content $f -Raw

# Dark backgrounds → deeper, more saturated purple-blacks
$c = $c -replace '#080818','#03000e'
$c = $c -replace '#0a0a20','#060020'
$c = $c -replace '#060612','#040012'
$c = $c -replace '#050510','#030010'
$c = $c -replace '#0e0a2e','#0d003e'
$c = $c -replace '#061524','#001530'
$c = $c -replace '#1e1b4b','#1a0055'
$c = $c -replace '#0f172a','#0a0035'
$c = $c -replace '#083344','#003545'

# Primary indigo → electric violet
$c = $c -replace '#6366f1','#9333ea'
$c = $c -replace 'rgba\(99,102,241','rgba(147,51,234'

# Secondary violet → bright fuchsia/magenta
$c = $c -replace '#8b5cf6','#d946ef'
$c = $c -replace 'rgba\(139,92,246','rgba(217,70,239'

# Cyan accent → electric bright cyan
$c = $c -replace '#06b6d4','#22d3ee'
$c = $c -replace 'rgba\(6,182,212','rgba(34,211,238'

# Blue → sky blue / electric blue
$c = $c -replace '#3b82f6','#38bdf8'
$c = $c -replace 'rgba\(59,130,246','rgba(56,189,248'

# Update muted text to work with new deeper backgrounds
$c = $c -replace '#334155','#4b5680'
$c = $c -replace '#475569','#5b6898'

# Update purple glow references in gradients
$c = $c -replace 'rgba\(79, 70, 229','rgba(147, 51, 234'

Set-Content $f $c -NoNewline
Write-Host "Done - colors updated!"
