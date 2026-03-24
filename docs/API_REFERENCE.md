# SpaceLens API Reference

Basic documentation for the SpaceLens AI Tracking system.

Base URL: http://localhost:8000/api/v1  
Auth: Bearer Token (JWT)  
Docs: Swagger | ReDoc

## Table of Contents

1. Authentication
2. Module Name A
3. Module Name B
4. Status Codes

## 1. Authentication

### 1.1 Login

POST /auth/login

Request:

```json
{
  "username": "admin",
  "password": "password"
}
```

Response (200 OK):

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

## 2. [Module Name] - (TEMPLATE SECTION)

Devs: Copy this block for each new endpoint.

### 2.x [Endpoint Title]

METHOD /your/path

Description: What does it do?

Request Body / Query Params:

```json
{
  "key": "value"
}
```

Response:

```json
{
  "status": "success",
  "data": {}
}
```

## 4. Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

Last Updated: {{Date}}  
By: SpaceLens Team

## How to use this for the team

Keep this file in your root directory as API.md.

When someone finishes a feature (for example, Heatmaps), they go to Section 2, copy the template, and fill in the details.

Commit the changes to Git.