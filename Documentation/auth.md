# Front-end Integration Guide

This document describes how to interact with the two backend microservices:

1. **User Management Service**  
   Base URL: `http://localhost:8082`

   ● **Register**  
     • Endpoint: `POST /register`  
     • Payload (JSON):  
       ```json
       {
         "email": "user@example.com",
         "password": "secret123",
         "role": "student"               // one of: student, instructor, institution_representative
       }
       ```
     • Response:  
       - `201 Created` on success  
       - `400 Bad Request` with `{ "error": "…" }`  

   ● **Login**  
     • Endpoint: `POST /login`  
     • Payload (JSON):  
       ```json
       {
         "email": "user@example.com",
         "password": "secret123"
       }
       ```
     • Response:  
       - `200 OK` with `{ "token": "<JWT>" }`  
       - `401 Unauthorized` with `{ "error": "Invalid credentials" }`  

   ● **Validate Token**  
     • Endpoint: `GET /auth/validate`  
     • Headers:  
       ```  
       Authorization: Bearer <JWT>  
       ```  
     • Response:  
       - `200 OK` with `{ "user_id": "...", "email": "...", "role": "..." }`  
       - `401 Unauthorized` if missing/invalid token  

   **Notes**  
   - All endpoints return JSON.  
   - You must include the JWT in `Authorization` for protected routes.  

2. **Google Auth Service**  
   Base URL: `http://localhost:8086`

   ● **Google Login**  
     • Navigate browser to: `GET /auth/google/login`  
     • User is redirected to Google’s OAuth consent screen.  

   ● **Callback**  
     • Google redirects back to: `GET /auth/google/callback?code=...`  
     • Backend issues an HttpOnly cookie named `token` (JWT).  

   ● **Logout**  
     • Endpoint: `GET /auth/logout`  
     • Clears the `token` cookie.  

   ● **Protected Resource**  
     • Endpoint: `GET /protected`  
     • Browser automatically sends the `token` cookie.  
     • Returns plain text or `401 Unauthorized` if missing/invalid.  

   **Notes**  
   - The frontend should open `/auth/google/login` in a new window or redirect the user directly.  
   - After callback, the `token` cookie is set for the domain; use it for subsequent requests.  
   - CORS must allow your front-end origin (e.g. `http://localhost:3000`).  

## CORS & Security

- **CORS**  
  - Both services need to allow requests from your SPA origin (`http://localhost:3000`).  
  - Configure backend to include:  
    ```http
    Access-Control-Allow-Origin: http://localhost:3000
    Access-Control-Allow-Credentials: true
    ```
- **Credentials**  
  - When calling protected endpoints on the Google service, set `fetch(..., { credentials: 'include' })` so the cookie is sent.  
  - For JWT header flows (User Management), send the JWT in `Authorization`.

## Summary

- User-Management: JSON payloads, JWT returned in body, header-based auth.  
- Google-Auth: browser-based OAuth, JWT in cookie, cookie-based auth.  
- Ensure CORS and credential forwarding are properly configured in your HTTP client.  