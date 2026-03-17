Write-Host "Searching for git.exe..."

# 1. Check PATH
$gitPath = Get-Command git.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source

# 2. Check Common Paths (C: and D:)
if (-not $gitPath) {
    $possiblePaths = @(
        "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe",
        "$env:ProgramFiles\Git\cmd\git.exe",
        "$env:ProgramFiles\Git\bin\git.exe",
        "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
        "${env:ProgramFiles(x86)}\Git\bin\git.exe",
        "C:\Users\pc\scoop\apps\git\current\bin\git.exe",
        "C:\ProgramData\chocolatey\bin\git.exe",
        "D:\Git\cmd\git.exe",
        "D:\Git\bin\git.exe",
        "D:\Program Files\Git\cmd\git.exe",
        "D:\Program Files\Git\bin\git.exe",
        "D:\Software\Git\cmd\git.exe",
        "D:\Tools\Git\cmd\git.exe"
    )

    foreach ($pattern in $possiblePaths) {
        $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        if ($found) {
            $gitPath = $found
            break
        }
    }
}

# 3. Recursive Search on AppData (User hint)
if (-not $gitPath) {
    Write-Host "Checking AppData recursively..."
    $gitPath = Get-ChildItem -Path "$env:LOCALAPPDATA" -Filter git.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

# 4. Recursive Search on D: (Last Resort)
if (-not $gitPath) {
    Write-Host "Searching D:\ recursively..."
    $gitPath = Get-ChildItem -Path D:\ -Filter git.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

if (-not $gitPath) {
    Write-Error "Could not find git.exe. Please verify Git is installed or edit this script to set `$gitPath manually."
    exit 1
}

Write-Host "Found Git at: $gitPath"

Write-Host "Configuring safe directory..."
& $gitPath config --global --add safe.directory D:/HAMMR-Project

Write-Host "Initializing Git Repository..."
& $gitPath init

Write-Host "Configuring Remote Origin..."
$remotes = & $gitPath remote
if ($remotes -contains "origin") {
    Write-Host "Remote 'origin' already exists. Updating URL..."
    & $gitPath remote set-url origin https://github.com/santy2049/Hammr.git
} else {
    Write-Host "Adding remote 'origin'..."
    & $gitPath remote add origin https://github.com/santy2049/Hammr.git
}

Write-Host "Renaming branch to main..."
& $gitPath branch -M main

Write-Host "Adding files..."
& $gitPath add .

Write-Host "Committing changes..."
& $gitPath commit -m "Implement Contractor and Job Services"

Write-Host "Pulling remote changes..."
& $gitPath pull origin main --rebase

Write-Host "Pushing to GitHub..."
& $gitPath push -u origin main

Write-Host "Done!"
