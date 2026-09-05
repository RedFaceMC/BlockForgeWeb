# BlockForge — Production Deployment

This package is the existing BlockForge project prepared for deployment.

## Required production services
A real public marketplace needs persistent services. Configure:
- MySQL-compatible database (`DATABASE_URL`)
- Authentication/storage provider used by the existing backend
- Any API key/URL variables referenced by the server

Do NOT commit secrets to GitHub.

## Vercel
Import this repository into Vercel and deploy from the repository root.

If Vercel asks for a framework, select Vite/Other and use the project's existing build configuration.

## Important
The project can display live Modrinth catalog data, but Modrinth remains the source of those external projects. Uploaded creator files must use persistent storage; Vercel's local filesystem is not permanent.

## Download gate
The intended flow is:
Visitor -> Sign in/sign up -> authenticated download

## Creator flow
Visitor -> Sign in/sign up -> Creator Studio -> upload project/version -> publish
