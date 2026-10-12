# clearSKY: Grade Management SaaS

A microservices SaaS platform where universities publish exam grades, students view their grades and request reviews, and instructors handle those reviews. Institutions pay for the service with credits.

Team project for **SaaS 2025** at the School of Electrical & Computer Engineering, National Technical University of Athens (NTUA), Team 12.

![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

---

## My role: front-end developer

I built and maintained most of the front-end: 49 of the 59 commits in [`front-end/`](front-end). I also worked on the API gateway and the user service so the UI could talk to the backend.

- **Web app (Node.js + Express + EJS):** server-side rendered UI with session-based, role-aware routing for the three user types (student, instructor, institution representative). It has about 20 views and shared partials (header, role-specific navbars, flash messages).
- **API client layer:** ES-module wrappers in [`front-end/public/api/`](front-end/public/api) around a generic `request()` helper. The helper attaches the JWT, serializes JSON, query strings and `FormData` uploads, and normalizes errors.
- **Authentication flows:** sign-up, login and logout pages, plus the **Google OAuth** redirect and callback proxy to the auth service.
- **Grade statistics:** interactive grade-distribution charts built with **Apache ECharts**, for students, instructors and institutions.
- **Instructor & institution tools:** XLSX upload of initial and final grades, the review-request inbox and reply form, buying credits, registering institutions and managing users.
- **Student tools:** personal grades per course, review requests and their status.
- **Containerization:** the front-end Dockerfile and its integration into the root `docker-compose.yml`.
- **Backend glue:** routes and handlers in the Go **orchestrator** (Gin), and changes to the **user management service**, to expose the endpoints the UI needs.

---

## Features by role

| Role | Capabilities |
|---|---|
| **Student** | View courses and personal grades, request a grade review, track review status, view course statistics |
| **Instructor** | Upload initial and final grade sheets (XLSX), see review requests, reply to students, view statistics |
| **Institution representative** | Register the institution, buy credits, manage users, view statistics |

---

## Architecture

The browser talks only to the **front-end** (Express/EJS) and the **orchestrator**, a Go/Gin API gateway that validates JWTs and enforces roles. The orchestrator talks to each microservice asynchronously over **RabbitMQ**. Every service owns its database.

```mermaid
flowchart LR
    B[Browser] --> FE["front-end<br/>Express + EJS :3000"]
    B -->|REST + JWT| OR["orchestrator<br/>Go / Gin :8080"]
    FE -->|OAuth redirect| GA["google_auth_service<br/>Go"]
    OR <--> MQ(("RabbitMQ"))
    MQ <--> UM["user_management_service<br/>Go"]
    MQ <--> RG["registration_service<br/>Go + PostgreSQL"]
    MQ <--> CR["credits_service<br/>Go + PostgreSQL"]
    MQ <--> SR["student_request_review_service<br/>Go + PostgreSQL"]
    MQ <--> IR["instructor_review_reply_service<br/>Go + PostgreSQL"]
    MQ <--> IG["initial_grades<br/>Node + MongoDB"]
    MQ <--> FG["final_grades<br/>Node + MongoDB"]
    MQ <--> ST["stats_service<br/>Node + MySQL"]
    MQ <--> VG["View_personal_grades<br/>Node + MySQL"]
```

---

## Running locally

Requirements: Docker and Docker Compose.

```bash
git clone https://github.com/DimitriosLiakis/clearsky-grading-saas.git
cd clearsky-grading-saas
docker compose up --build
```

- Front-end: http://localhost:3000
- Orchestrator API: http://localhost:8080
- RabbitMQ management UI: http://localhost:15673

> **Configuration:** the `.env` files with credentials are not part of this public repository. Before you start, create a `.env` file in the repository root and in `google_auth_service/`. They need `JWT_SECRET`, `DATABASE_DSN`, `RABBITMQ_URL` and, for Google sign-in, your own `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the Google Cloud Console.

---

## Repository layout

```
front-end/                       Express + EJS web app (views/, public/js/, public/api/)
orchestrator/                    Go/Gin API gateway (JWT auth, role-based routes)
user_management_service/         Users, login, password management (Go)
google_auth_service/             Google OAuth 2.0 sign-in (Go)
registration_service/            Institution registration (Go + PostgreSQL)
credits_service/                 Credit purchases and balance (Go + PostgreSQL)
student_request_review_service/  Student review requests (Go + PostgreSQL)
instructor_review_reply_service/ Instructor replies (Go + PostgreSQL)
initial_grades/, final_grades/   XLSX grade import (Node + MongoDB)
stats_service/                   Grade distributions (Node + MySQL)
View_personal_grades/            Per-student grade view (Node + MySQL)
architecture/                    UML models (Visual Paradigm)
```

---

## Team

Built by Team 12 of the NTUA ECE SaaS 2025 course. See [contributors](../../graphs/contributors) for each member's work.
