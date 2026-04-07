import { auth, db, storage } from '../firebase';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { deleteUser } from 'firebase/auth';

// ---------------------------------------------------------------------------
// Data Export (GDPR Art. 20 — Right to Data Portability)
// ---------------------------------------------------------------------------

export async function exportUserData(uid) {
  const collections = ['profile', 'labResults', 'familyMembers', 'documents', 'insights'];
  const exportData = { exportedAt: new Date().toISOString(), uid };

  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, col));
      if (!snap.empty) {
        exportData[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch {
      // collection may not exist yet — skip
    }
  }

  // Also grab the root user document
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      exportData.userProfile = { id: userDoc.id, ...userDoc.data() };
    }
  } catch {
    // ignore
  }

  return exportData;
}

// ---------------------------------------------------------------------------
// Account Deletion (GDPR Art. 17 — Right to Erasure)
// ---------------------------------------------------------------------------

export async function deleteUserAccount(uid) {
  const subcollections = ['profile', 'labResults', 'familyMembers', 'documents', 'insights'];

  // 1. Delete all subcollection documents
  for (const col of subcollections) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, col));
      const deletes = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletes);
    } catch {
      // collection may not exist
    }
  }

  // 2. Delete root user document
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch {
    // ignore
  }

  // 3. Delete all files in Storage under users/{uid}/
  try {
    const userStorageRef = ref(storage, `users/${uid}`);
    const fileList = await listAll(userStorageRef);
    const storageDeletes = fileList.items.map((item) => deleteObject(item));
    await Promise.all(storageDeletes);
  } catch {
    // no files or bucket path doesn't exist
  }

  // 4. Delete Firebase Auth account
  const user = auth.currentUser;
  if (user) {
    await deleteUser(user);
  }
}

// ---------------------------------------------------------------------------
// Consent Management
// ---------------------------------------------------------------------------

const CONSENT_KEY = 'ledora_consent';

const defaultConsent = {
  analytics: false,
  marketing: false,
  functional: false,
  updatedAt: null,
};

export function getConsentStatus() {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // corrupt data — reset
  }
  return null;
}

export function setConsentStatus(prefs) {
  const consent = {
    ...defaultConsent,
    ...prefs,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

// ---------------------------------------------------------------------------
// Download Helper
// ---------------------------------------------------------------------------

export function downloadAsJson(data, filename = 'ledora-export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
