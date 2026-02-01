Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "Node processes stopped."
Start-Sleep -Seconds 2

if (Test-Path ".next") {
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .next
    Write-Host "Cache cleared."
}

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Write-Host "Generating Prisma Client..."
npx prisma generate

Write-Host "Pushing Database Schema..."
npx prisma db push

Write-Host "Seeding Database..."
npx prisma db seed

Write-Host "DONE. Please run 'npm run dev' to start the server."
