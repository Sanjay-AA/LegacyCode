# Legacy Rescue — Autonomous Software Modernization Platform

**Legacy Rescue** is an autonomous legacy modernization platform that transforms legacy Web, Backend, Mobile, Data, and Infrastructure codebases into modern software architectures.

---

## 🚀 Key Platform Capabilities

- **Automatic Technology Detection**: Detects source technology stack (jQuery, Vue, Angular, PHP, Java, Python, Android, SQL DDL, SOAP WSDL, Shell Scripts, etc.).
- **Universal Modernization Pipeline**:
  `Detect` → `Analyze` → `Plan` → `Migrate` → `Verify` → `Review` → `Ship`
- **Legacy Health Report & Risk Scoring**: Calculates deterministic code health scores out of 100, pattern counts, and code quality risks.
- **Behavioral Contract Generation**: Extracts initial state invariants, action-response mappings, and boundary rules preserved in modern targets.
- **Explainable Code Transformations**: Provides concise engineering explanations for every refactored pattern.
- **Executable Behavioral Verification**: Runs assertion tests against migrated source code to verify 100% behavioral equivalence.
- **Autonomous Self-Repair Loop**: Automatically detects failing tests, generates correction patches, and re-verifies (limited to 2 attempts max).
- **Human Approval Gate & GitHub Shipping**: Pauses for human review before creating Git branches, committing code, and opening GitHub Pull Requests.
- **Adapter Validation & Capability Health Checks**: Exposes a real-time capability matrix for all registered migration adapters.

---

## 🛠️ Supported & Experimental Migration Adapters

### **WEB Category**
- `jquery-to-react`: **`[IMPLEMENTED]`** jQuery → Modern React 18 Functional Components
- `vue-to-react`: **`[IMPLEMENTED]`** Vue.js 2/3 Options API → Modern React 18
- `angular-to-react`: **`[IMPLEMENTED]`** Angular Component & RxJS → Modern React 18

### **BACKEND Category**
- `php-to-laravel`: **`[IMPLEMENTED]`** Procedural PHP → Laravel 11 RESTful Controllers & Eloquent ORM
- `java-to-spring`: **`[IMPLEMENTED]`** Java HttpServlet → Spring Boot 3 `@RestController` & Spring Data JPA
- `python-to-fastapi`: **`[IMPLEMENTED]`** Synchronous Python WSGI → FastAPI Async Routes & Pydantic Validation

### **MOBILE Category**
- `android-java-to-kotlin`: **`[IMPLEMENTED]`** Android Java Activity → Kotlin & Jetpack Compose
- `react-native-modernization`: **`[IMPLEMENTED]`** React Native Class Components → React Native 0.74 Expo Hooks
- `legacy-mobile`: **`[EXPERIMENTAL]`** Cordova Webview → React Native

### **DATA Category**
- `schema-modernization`: **`[IMPLEMENTED]`** MySQL 5.5 DDL → PostgreSQL 16 Prisma Schema
- `database-migration`: **`[EXPERIMENTAL]`** Raw SQL Dump → Knex.js Migration Scripts
- `api-modernization`: **`[IMPLEMENTED]`** SOAP WSDL XML → OpenAPI 3.0 REST Specifications

### **INFRASTRUCTURE Category**
- `infrastructure-modernization`: **`[IMPLEMENTED]`** Bare-metal Shell Scripts → Kubernetes Helm Manifests & Container Spec
- `legacy-cloud-config`: **`[EXPERIMENTAL]`** CloudFormation JSON → Terraform 1.7+ HCL Modules

---

## 🧪 Testing Commands

```bash
# Run complete test suite (Capability validation, Cross-adapter pipeline, Failure recovery)
npm test

# Run adapter capability health checks
npm run test:adapters

# Run end-to-end pipeline streaming tests
npm run test:pipeline

# Run behavioral verification suite tests
npm run test:verification
```

---

## 🏗️ Architecture Overview

```
server/
├── src/
│   ├── adapters/
│   │   ├── BaseAdapter.js            # Universal Adapter Interface
│   │   ├── MigrationRegistry.js      # Central Adapter Registry
│   │   ├── web/                      # jQuery, Vue, Angular Adapters
│   │   ├── backend/                  # PHP, Java, Python Adapters
│   │   ├── mobile/                   # Android Java, React Native Adapters
│   │   ├── data/                     # MySQL DDL, SOAP WSDL Adapters
│   │   └── infrastructure/           # K8s Deployment Adapters
│   ├── pipeline/
│   │   ├── store.js                  # In-memory Session State
│   │   ├── history.js                # In-memory Migration Audit History
│   │   ├── analyzer.js               # jQuery Analysis & Risk Engine
│   │   ├── planner.js                # Migration Blueprint Generator
│   │   ├── migrator.js               # Code Transformation Engine
│   │   ├── verifier.js               # Behavioral Verification Engine
│   │   └── shipper.js                # Git & GitHub PR Shipper
│   ├── services/
│   │   ├── technologyDetector.js     # Auto Stack Detection Engine
│   │   └── adapterHealthChecker.js   # Automated Capability Audit Runner
│   └── routes/
│       └── pipeline.js               # SSE Streaming API & Health Endpoints
```

---

## ➕ How to Add a New Migration Adapter

1. Extend `BaseAdapter` in `server/src/adapters/<category>/YourAdapter.js`.
2. Implement `detect()`, `analyze()`, `createPlan()`, `migrate()`, and `verify()`.
3. Register your new adapter instance in `MigrationRegistry.js`.
4. Add a sample fixture in `samples/<category>/<adapter-id>/sample.<ext>`.
5. Run `npm test` to verify 100% capability health check passing!
