# my-task-manager-frontend

# Technology Decisions

## Frontend – React with JavaScript & TypeScript

This frontend was initially built in plain JavaScript to focus on mastering core JavaScript and React fundamentals without relying on static typing.

The goal was to deeply understand:

- Runtime behavior
- State management
- Component composition
- UI logic and iteration cycles

---

### Why TypeScript is now introduced

As the project evolved, TypeScript was introduced selectively to improve:

- API integration safety (via OpenAPI code generation)
- Developer experience (autocomplete, type safety)
- Maintainability of growing codebase

---

### Philosophy

- Core application logic can remain flexible and JavaScript-like
- TypeScript is primarily used where it adds **real value**, such as:
    - API contracts
    - external system integration
    - shared data structures

---

### Key Takeaway

This project is not about blindly using TypeScript everywhere.

It is about:

> understanding JavaScript first, and then applying TypeScript where it actually improves the system

## Backend – Node.js with TypeScript

The backend application is written in TypeScript.

Backend systems usually involve:

- DTOs and structured data contracts
- API boundaries
- Business logic
- Database models
- Validation layers
- Larger and long-lived codebases

In this context, TypeScript improves maintainability, refactoring safety, and contract clarity.

## Philosophy

Technology decisions in this project are intentional and context-driven.

While TypeScript is highly valuable in structured backend systems, I prefer JavaScript for frontend applications.

One of the main goals of this project is to strengthen and deepen my understanding of JavaScript itself — especially its runtime behavior, flexibility, and core language mechanics.

The goal is not to follow trends blindly, but to deliberately choose tools based on learning objectives and architectural needs.

## Styling Approach

This project intentionally uses plain CSS instead of SCSS.

The goal is to strengthen and master core CSS fundamentals, including layout systems (Flexbox, Grid), specificity, cascade behavior, and responsive design — without relying on preprocessors.

Understanding the foundation before adding abstraction layers is a deliberate learning choice.

# OpenAPI Client Generation

This project follows a contract-first approach.

The OpenAPI specification is stored in a separate GitHub repository.  
The API client is generated from that specification and should never be edited manually.

---

## Install the OpenAPI Specification

```bash
npm install github:popbojan/my-task-manager-spec --legacy-peer-deps
```

```
npm install -D @openapitools/openapi-generator-cli --legacy-peer-deps
```

```
npx openapi-generator-cli generate \
  -i node_modules/@popbojan/task-manager-contract/openapi.yaml \
  -g typescript-fetch \
  -o src/api/generated
```

Add this to your package.json:

```
"scripts": {
  "generate:api": "openapi-generator-cli generate -i node_modules/@popbojan/task-manager-contract/openapi.yaml -g typescript-fetch -o src/api/generated"
}
```

Then regenerate with:

```
npm run generate:api
```

Add to .gitignore:

```
src/api/generated/
```





