# clipboard-api

A small URL shortener API built with **Node.js** and **TypeScript** — no Express/Fastify. The goal is to learn real server patterns by hand: HTTP, validation, layered architecture, swappable storage, errors, and tests.

## What it does

Users create short codes for long URLs. Hitting the short path redirects to the original link and records clicks. Clients can list links, inspect stats, and delete entries.

## Why this project

Most tutorials jump straight into a framework. This repo starts from `node:http` and grows into a maintainable service so you can see **why** routers, services, stores, and middleware exist — and what frameworks later hide for you.

## Features

- Create short links (auto-generated or custom codes)
- Redirect with click tracking
- List links (with `limit` query validation)
- Stats and delete by code
- Request validation with Zod + shared `Result` types
- Typed API errors (`AppError`) and centralized error mapping
- Request IDs (`x-request-id`) and simple access logs
- Swappable persistence behind a `LinkStore` interface:
  - in-memory
  - JSON file (atomic write)
  - SQLite (`node:sqlite`)
- Unit tests with Node’s built-in test runner

## Architecture

```text
HTTP (router / routes)
    → LinkService  (business rules)
        → LinkStore  (memory | file | sqlite)