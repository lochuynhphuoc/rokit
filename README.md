# RoKit

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white" alt="MongoDB 7" />
</p>

RoKit is a Roblox-focused tool directory that showcases a library of utilities and external resources in a clean, modern interface.

## Overview

This project focuses on:
- displaying available Roblox tools and utilities
- linking to external projects and services
- managing the tool list through MongoDB
- allowing admin users to add, remove, update, and reorder items

## Key Features

- modern landing page for a Roblox toolkit ecosystem
- dynamic tool list loaded from MongoDB
- status badges for each tool: Available / Unavailable
- automatic favicon retrieval from each tool domain
- admin-managed updates through API endpoints
- ordering support for the displayed tool list

## Technology Stack

| Category | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| UI Library | Lucide React |
| Backend | Next.js API Routes |
| Database | MongoDB |
| Hosting | Vercel |

## Project Structure

```bash
rokit/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── tools/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── package.json
├── tsconfig.json
├── next.config.ts
├── README.md
└── public/
```

## Environment Variables

The project requires the following environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@host/dbname
ADMIN_PASS=your_admin_password
```

## Notes

- Tool data is stored in the MongoDB collection `rokit.tools`
- When the database is empty, the site may show an empty or limited list
- Some tools may appear as unavailable depending on their external status or link validity

## Goal

RoKit acts as a central portal for Roblox-related utilities and is designed to scale with additional tools and features over time.

---

<p align="center">
  <strong>RoKit</strong><br>
  A curated toolkit hub for Roblox users and developers.
</p>
