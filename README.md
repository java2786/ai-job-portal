# AI Job Portal

A full-stack job portal with a React and TypeScript frontend and a Node.js/Express backend. Candidates can browse jobs, apply, maintain resume text, and receive an OpenAI-generated skills and job-match evaluation. Admin users can publish jobs.

## Project Structure
 
```text
app/
├── client/        # React + TypeScript + Vite frontend
└── server/        # Node.js + Express API
```

## Main Features

- Candidate and admin signup/login
- JWT-based authentication with seven-day tokens
- Password hashing with bcryptjs
- Authenticated job listing and job details
- Admin-only job creation
- Candidate applications and application status
- Resume text storage
- OpenAI extraction of technical skills from resume text
- OpenAI match score and feedback for a job
- Candidate profile with application results

## Architecture Flow

```text
Browser
  |
  | React UI (Vite)
  | - Auth, job list, job detail, profile, post-job views
  | - Stores JWT and user in localStorage
  v
Express API
  |
  | CORS, JSON parsing, JWT verification, admin authorization
  |
  +--> /api/auth       --> Candidate model --> MongoDB
  +--> /api/jobs       --> Job controller --> Job model --> MongoDB
  +--> /api/candidate  --> Candidate controller --> MongoDB
                                  |
                                  v
                            OpenAI service
                         skills extraction and
                         match score generation
```

### Candidate AI flow

1. A candidate signs up, logs in, and receives a JWT.
2. The candidate stores resume text through `PATCH /api/candidate/me/resume`.
3. The candidate applies to a job through `POST /api/candidate/apply`.
4. The frontend requests `POST /api/candidate/match`.
5. The server extracts skills from the resume with OpenAI, compares them with the job requirements, saves the score and feedback in the application, and returns the result.

## Frontend: `client`

### Technologies

- React 19
- TypeScript 6
- Vite 8
- React DOM
- ESLint with React Hooks and React Refresh plugins
- Browser `fetch` API and `localStorage`

### Frontend flow

`App.tsx` controls authentication state and the active view. Unauthenticated users see `Auth`; authenticated users can navigate to jobs, job details, or their profile. Admin users also see the post-job view. API calls send the stored token as `Authorization: Bearer <token>`.

The API base URL is currently an empty string in `src/data/api.ts`, so the frontend expects the API to be available on the same origin or through a development/deployment proxy.

### Frontend commands

```bash
cd client
npm install
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

## Backend: `server`

### Technologies

- Node.js with CommonJS modules
- Express 5
- MongoDB through Mongoose
- JSON Web Tokens through `jsonwebtoken`
- Password hashing through `bcryptjs`
- CORS and `dotenv`
- OpenAI Node.js SDK
- Nodemon for development

### Backend flow

`server.js` loads environment variables, connects to MongoDB, enables CORS and JSON parsing, serves the backend `public` directory, and mounts the three route groups. Controllers handle validation and persistence. `verifyToken` validates JWTs, while `requireAdmin` protects job creation.

### Backend commands

```bash
cd server
npm install
npm run dev       # Start with nodemon
npm start         # Start with Node.js
```

### Environment variables

Create `server/.env` with values similar to:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=replace_with_a_long_secret
OPENAI_API_KEY=replace_with_your_key
OPENAI_CHEAP_MODEL=your_openai_model
```

`PORT`, `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, and `OPENAI_CHEAP_MODEL` are read by the server. MongoDB must be running and the OpenAI credentials must be available for AI evaluation.

## API Endpoints

All protected endpoints require:

```text
Authorization: Bearer <jwt>
```

### Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Create a candidate or admin account. Body: `name`, `email`, `password`, optional `role`. |
| `POST` | `/api/auth/login` | Public | Validate credentials and return a JWT plus user data. Body: `email`, `password`. |

### Jobs

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/jobs` | Authenticated | Return all jobs. |
| `GET` | `/api/jobs/:id` | Authenticated | Return one job by MongoDB ID. |
| `POST` | `/api/jobs` | Admin only | Create a job. Required fields: `title`, `company`; other fields include `location`, `remote`, `skillsRequired`, `experienceRequired`, and `description`. |

### Candidate

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/candidate/me` | Authenticated | Return the logged-in candidate profile and applications. |
| `POST` | `/api/candidate/apply` | Authenticated | Apply to a job. Body: `{ "jobId": "..." }`. Duplicate applications are rejected. |
| `POST` | `/api/candidate/match` | Authenticated | Evaluate an existing application with OpenAI. Body: `{ "jobId": "..." }`. |
| `PATCH` | `/api/candidate/me/resume` | Authenticated | Update stored resume text. Body: `{ "resumeText": "..." }`. |

## Data Models

- **Candidate:** name, email, hashed password, role (`candidate` or `admin`), resume text, parsed skills, and applications.
- **Application:** job ID, match score, AI feedback, and status (`applied` or `evaluated`).
- **Job:** title, company, location, remote flag, required skills, required experience, description, and creation date.

## OpenAI Integration

The backend uses the configured chat-completions model with JSON responses:

1. `parseResumeSkills` extracts technical skills into a skills array.
2. `getMatchScore` compares those skills with the job's required skills and experience, returning a score from 0 to 100 and short feedback.

AI failures are handled by returning an empty skill list or a zero score with fallback feedback, while the API reports an evaluation error when the overall request cannot complete.

## Notes

- The backend listens on the port specified by `PORT`; the example request files use `http://localhost:3000`.
- The frontend currently uses relative API paths, so configure a same-origin proxy or serve the frontend and API under the same origin when running them separately.
- `config/seed.js` can be used to replace the jobs collection with the sample jobs in `config/seed_jobs_data.js`.
- Example HTTP requests are available in the backend directory, including authentication, jobs, candidate, and AI evaluation requests.
