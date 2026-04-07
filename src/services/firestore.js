import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, orderBy, onSnapshot, serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// ═══════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════

export async function saveUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function onUserProfile(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, (error) => {
    console.warn("onUserProfile error:", error.message);
    callback(null);
  });
}

// ═══════════════════════════════════════
// LAB RESULTS
// ═══════════════════════════════════════

export async function addLabResult(uid, data) {
  const ref = collection(db, "users", uid, "labResults");
  return addDoc(ref, { ...data, createdAt: serverTimestamp() });
}

export async function updateLabResult(uid, docId, data) {
  const ref = doc(db, "users", uid, "labResults", docId);
  return updateDoc(ref, data);
}

export function onLabResults(uid, callback) {
  const ref = collection(db, "users", uid, "labResults");
  const q = query(ref, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.warn("onLabResults error:", error.message);
    callback([]);
  });
}

// ═══════════════════════════════════════
// FAMILY MEMBERS
// ═══════════════════════════════════════

export async function setFamilyMember(uid, memberId, data) {
  const ref = doc(db, "users", uid, "familyMembers", memberId);
  return setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteFamilyMember(uid, memberId) {
  return deleteDoc(doc(db, "users", uid, "familyMembers", memberId));
}

export function onFamilyMembers(uid, callback) {
  const ref = collection(db, "users", uid, "familyMembers");
  return onSnapshot(ref, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.warn("onFamilyMembers error:", error.message);
    callback([]);
  });
}

// ═══════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════

export async function addDocument(uid, metadata) {
  const ref = collection(db, "users", uid, "documents");
  return addDoc(ref, { ...metadata, createdAt: serverTimestamp() });
}

export async function updateDocument(uid, docId, data) {
  const ref = doc(db, "users", uid, "documents", docId);
  return updateDoc(ref, data);
}

export async function deleteDocumentMeta(uid, docId) {
  return deleteDoc(doc(db, "users", uid, "documents", docId));
}

export function onDocuments(uid, callback) {
  const ref = collection(db, "users", uid, "documents");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.warn("onDocuments error:", error.message);
    callback([]);
  });
}

// ═══════════════════════════════════════
// INSIGHTS
// ═══════════════════════════════════════

export async function setInsights(uid, insights) {
  const batch = writeBatch(db);
  // Clear existing insights
  const ref = collection(db, "users", uid, "insights");
  const snap = await getDoc(doc(db, "users", uid));
  // Write new insights
  for (const insight of insights) {
    const newRef = doc(collection(db, "users", uid, "insights"));
    batch.set(newRef, { ...insight, createdAt: serverTimestamp() });
  }
  await batch.commit();
}

export async function addInsight(uid, insight) {
  const ref = collection(db, "users", uid, "insights");
  return addDoc(ref, { ...insight, createdAt: serverTimestamp() });
}

export function onInsights(uid, callback) {
  const ref = collection(db, "users", uid, "insights");
  return onSnapshot(ref, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.warn("onInsights error:", error.message);
    callback([]);
  });
}

// ═══════════════════════════════════════
// INTEGRATIONS (wearable connections)
// ═══════════════════════════════════════

export async function setIntegration(uid, serviceId, data) {
  const ref = doc(db, "users", uid, "integrations", serviceId);
  return setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteIntegration(uid, serviceId) {
  return deleteDoc(doc(db, "users", uid, "integrations", serviceId));
}

export function onIntegrations(uid, callback) {
  const ref = collection(db, "users", uid, "integrations");
  return onSnapshot(ref, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.warn("onIntegrations error:", error.message);
    callback([]);
  });
}
