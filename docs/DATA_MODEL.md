# Firestore Data Model

Top-level collections, each document flat (no nested subcollections) so cross-mine queries
and the AI service's reads stay simple. Relationships are plain ID references (`mineId`,
`inspectionId`, etc.) resolved in application code — Firestore has no foreign keys or joins.

| Collection | Document fields | References |
|---|---|---|
| `users` | name, email, role (`field_officer`\|`mine_official`\|`corporate`\|`admin`), mineId (nullable), status, createdAt | mineId → mines |
| `mines` | name, code, zone, latitude, longitude, status, createdAt | — |
| `inspections` | mineId, inspectorId, inspectionDate, status, checklist (map), createdAt, updatedAt | mineId → mines, inspectorId → users |
| `observations` | inspectionId, category, description, severity, status, createdAt | inspectionId → inspections |
| `violations` | observationId (nullable), inspectionId, mineId, category, severity, description, status, detectedAt, createdAt | observationId → observations, mineId → mines |
| `complianceRequirements` | mineId, title, description, category, dueDate, status, isRecurring, createdAt | mineId → mines |
| `correctiveActions` | violationId, assignedTo, description, targetDate, status, verifiedBy, verifiedAt, createdAt, updatedAt | violationId → violations, assignedTo/verifiedBy → users |
| `documents` | relatedEntityType, relatedEntityId, fileName, filePath, fileType, ocrText, uploadedBy, uploadedAt | polymorphic → relatedEntityType/Id |
| `notifications` | userId, type, title, message, relatedEntityType, relatedEntityId, isRead, createdAt | userId → users |
| `auditLogs` | actorId, action, entityType, entityId, oldValue (map), newValue (map), createdAt | actorId → users, append-only |
| `riskScores` | mineId, score, level, factors (map), computedAt | mineId → mines, latest-first per mine |

## Notes on the Postgres → Firestore translation

- **IDs**: Firestore auto-IDs everywhere except `users`, which uses the Firebase Auth `uid`
  as the document ID so the two stay in lock-step.
- **"Foreign keys"**: enforced in the backend service layer (e.g. reject a violation whose
  `mineId` doesn't exist), not by the database — there is no DB-level constraint in Firestore.
- **Overdue queries** (`dueDate < now AND status != 'closed'`): Firestore range queries need
  a matching composite index — see `firestore.indexes.json`.
- **Role/RBAC**: the role is stored twice on purpose — as a **custom claim** on the Firebase
  Auth token (source of truth, set server-side, used by `firestore.rules` and backend
  `auth.js` middleware) and mirrored into the `users` Firestore document for queries.
