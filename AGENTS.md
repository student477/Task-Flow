# AGENTS.md — TaskFlow Agent Operating Guidelines

This document establishes the binding protocols, workflow phases, and development rules for any AI agent working on the TaskFlow project.

---

## 1. Core Operating Principles
- **Clean Separation:** Absolute separation between React Vite client and Node.js Express server.
- **No Mock Services:** Never replace the backend or database with mock services or static in-memory fakes. All data must persist in MongoDB via Mongoose.
- **No Monolithic Components:** Break views down into modular, single-responsibility components.
- **Inspect Before Editing:** Always inspect existing code and architecture before making additions or modifications.
- **Strict Verification:** Never claim a phase or feature is complete without executing and verifying it.

---

## 2. Standard Workflow & Phasing
Work must proceed in small, verifiable phases:
1. **Planning & Setup:** Establish structure, dependencies, and configuration.
2. **Backend Services:** Models, routes, authentication, authorization, controllers.
3. **Frontend System:** Design primitives, layout shell, routing, state contexts.
4. **Integration:** Connect UI views to backend REST APIs.
5. **Testing & Hardening:** Verify happy path, edge cases, error states, and security.

---

## 3. Communication Protocol
After completing each phase, the agent must report:
1. **What was implemented:** Detailed summary of features and functionality built.
2. **Files created or modified:** Exact file paths with clickable links.
3. **How to run and test it:** Precise commands to launch, verify, and test the endpoints or UI.
4. **Errors found and fixed:** Transparent log of issues encountered during implementation and their resolutions.
5. **Remaining work:** Upcoming tasks for the next phase.

---

## 4. Security & Quality Standards
- Passwords must be hashed using `bcryptjs` (salt rounds >= 10).
- Private endpoints must validate JWT tokens via auth middleware.
- Project and task endpoints must verify that `req.user._id` belongs to the target project with adequate role permissions.
- Inputs must be validated and sanitized on both client and server.
- Never hardcode or leak credentials, JWT secrets, or sensitive fields.
