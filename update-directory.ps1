# Save as update_directory.ps1
$projectRoot = "."
$outputFile = "./.notes/directory_structure.md"

# Generate directory listing
function Get-FormattedDirectory {
    param (
        [string]$path,
        [int]$indent = 0
    )

    $indentString = "    " * $indent
    $content = ""

    foreach ($item in Get-ChildItem -Path $path -Force) {
        if ($item.PSIsContainer) {
            $content += "$indentString- **$($item.Name)/**`n"
            $content += Get-FormattedDirectory -path $item.FullName -indent ($indent + 1)
        } else {
            $content += "$indentString- $($item.Name)`n"
        }
    }
    return $content
}

# Generate content for markdown file
$markdownContent = @"
# Current Directory Structure

## Core Components

```
$(Get-FormattedDirectory -path $projectRoot)
```
"@

# Output to file
$markdownContent | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Directory structure updated in $($outputFile)"