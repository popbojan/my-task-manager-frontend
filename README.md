# my-task-manager-frontend

# Technology Decisions

## Frontend – React with JavaScript

This frontend is intentionally written in JavaScript.

The goal is to deeply understand core JavaScript and React fundamentals without relying on static typing.

Frontend development typically involves:

- Complex UI logic
- Fast iteration cycles
- State experimentation
- Component design and composition
- Mastering runtime behavior

JavaScript provides flexibility and reinforces a deeper understanding of how the language works at runtime.

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
npm install github:popbojan/my-task-manager-spec
```

```
npm install -D @openapitools/openapi-generator-cli
```

```
npx openapi-generator-cli generate \
  -i node_modules/@popbojan/task-manager-contract/openapi.yaml \
  -g javascript \
  -o src/api/generated
```

Add this to your package.json:

```
"scripts": {
"generate:api": "openapi-generator-cli generate -i node_modules/@popbojan/task-manager-contract/openapi.yaml -g javascript -o src/api/generated"
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





