# Ce script lance le backend et le frontend dans deux fenêtres séparées.

Write-Host "Démarrage du Backend (Spring Boot)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend\backend; .\mvnw.cmd spring-boot:run"

Write-Host "Démarrage du Frontend (Vite)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd TENDO; pnpm run dev"

Write-Host "Les deux serveurs sont en cours de lancement dans de nouvelles fenêtres !" -ForegroundColor Yellow
