---
name: API Design Mastery
description: Design RESTful and GraphQL APIs following OpenAPI 3.1 spec, versioning strategies, and contract-first development. Includes documentation generation and mock server setup.
license: MIT
---

# API Design Mastery

This skill provides comprehensive guidance on designing robust, scalable APIs that developers love to use.

## Core Capabilities

- **Contract-first development**: Define your API spec before writing code
- **OpenAPI 3.1 support**: Full schema validation, examples, and documentation generation
- **Versioning strategies**: URI versioning, header versioning, and deprecation patterns
- **Mock servers**: Instant mock generation from your spec for parallel frontend/backend development

## When to Use

Use this skill when you need to:
- Design a new REST or GraphQL API from scratch
- Review and improve an existing API design
- Generate SDK clients from an OpenAPI spec
- Set up automated API documentation

## Example: OpenAPI Spec Skeleton

```yaml
openapi: 3.1.0
info:
  title: My Service API
  version: "1.0.0"
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: User found
```

## Best Practices

1. **Use nouns, not verbs** in endpoint paths
2. **Return consistent error shapes** across all endpoints
3. **Version from day one** — don't wait until you need to break things
4. **Document every field** — future-you will thank you
