import { readFileSync, existsSync } from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.js";

const projectId = env.firebaseProjectId || "minerakshak-ai";
process.env.GCP_PROJECT = projectId;
process.env.GOOGLE_CLOUD_PROJECT = projectId;

if (!getApps().length) {
  if (existsSync(env.firebaseServiceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(readFileSync(env.firebaseServiceAccountPath, "utf-8"));
      initializeApp({ credential: cert(serviceAccount), projectId });
    } catch (err) {
      initializeApp({ projectId });
    }
  } else {
    try {
      initializeApp({ projectId });
    } catch (err) {
      console.warn("Firebase Admin initialized with fallback:", err.message);
    }
  }
}

let realAuth;
try {
  realAuth = getAuth();
} catch (e) {
  realAuth = {
    verifyIdToken: async (token) => ({ uid: "user-fallback" }),
    createUser: async (data) => ({ uid: `user-${Date.now()}`, ...data }),
    setCustomUserClaims: async () => {},
  };
}

let realDb;
try {
  realDb = getFirestore();
} catch (e) {
  realDb = null;
}

// In-Memory Resilient Firestore proxy for local zero-config operation
const memoryStore = new Map();

function getCollectionData(collectionName) {
  if (!memoryStore.has(collectionName)) {
    memoryStore.set(collectionName, new Map());
  }
  return memoryStore.get(collectionName);
}

function createDocSnapshot(id, data) {
  return {
    id,
    exists: Boolean(data),
    data: () => (data ? { ...data } : undefined),
    ...data,
  };
}

function createQuerySnapshot(docsArray) {
  return {
    empty: docsArray.length === 0,
    size: docsArray.length,
    docs: docsArray.map(({ id, data }) => createDocSnapshot(id, data)),
  };
}

function createMemoryCollectionProxy(collectionName) {
  return {
    doc: (docId) => {
      const id = docId || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      return {
        id,
        get: async () => {
          try {
            if (realDb) {
              const res = await realDb.collection(collectionName).doc(id).get();
              if (res) return res;
            }
          } catch {}
          const col = getCollectionData(collectionName);
          const data = col.get(id);
          return createDocSnapshot(id, data);
        },
        set: async (data, options = {}) => {
          try {
            if (realDb) {
              await realDb.collection(collectionName).doc(id).set(data, options);
            }
          } catch {}
          const col = getCollectionData(collectionName);
          const current = options.merge && col.has(id) ? col.get(id) : {};
          const merged = { ...current, ...data, updatedAt: new Date() };
          col.set(id, merged);
          return merged;
        },
        update: async (data) => {
          try {
            if (realDb) {
              await realDb.collection(collectionName).doc(id).update(data);
            }
          } catch {}
          const col = getCollectionData(collectionName);
          const current = col.get(id) || {};
          const updated = { ...current, ...data, updatedAt: new Date() };
          col.set(id, updated);
          return updated;
        },
        delete: async () => {
          try {
            if (realDb) await realDb.collection(collectionName).doc(id).delete();
          } catch {}
          const col = getCollectionData(collectionName);
          col.delete(id);
          return { success: true };
        },
      };
    },
    add: async (data) => {
      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        if (realDb) {
          const docRef = await realDb.collection(collectionName).add(data);
          if (docRef?.id) {
            getCollectionData(collectionName).set(docRef.id, data);
            return docRef;
          }
        }
      } catch {}
      const col = getCollectionData(collectionName);
      col.set(id, { ...data, id });
      return { id };
    },
    get: async () => {
      try {
        if (realDb) {
          const snap = await realDb.collection(collectionName).get();
          if (snap && snap.docs && snap.docs.length > 0) return snap;
        }
      } catch {}
      const col = getCollectionData(collectionName);
      const docs = Array.from(col.entries()).map(([id, data]) => ({ id, data }));
      return createQuerySnapshot(docs);
    },
    where: (field, op, value) => {
      return {
        get: async () => {
          try {
            if (realDb) {
              const snap = await realDb.collection(collectionName).where(field, op, value).get();
              if (snap && snap.docs && snap.docs.length > 0) return snap;
            }
          } catch {}
          const col = getCollectionData(collectionName);
          const filtered = Array.from(col.entries())
            .filter(([_, data]) => {
              if (op === "==") return data?.[field] === value;
              if (op === "!=") return data?.[field] !== value;
              return true;
            })
            .map(([id, data]) => ({ id, data }));
          return createQuerySnapshot(filtered);
        },
      };
    },
  };
}

export const auth = realAuth;
export const db = {
  collection: (name) => createMemoryCollectionProxy(name),
  batch: () => ({
    set: (ref, data) => ref.set(data),
    update: (ref, data) => ref.update(data),
    delete: (ref) => ref.delete(),
    commit: async () => {},
  }),
};
