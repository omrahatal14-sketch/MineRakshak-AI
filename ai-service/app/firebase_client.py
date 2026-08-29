import os
import firebase_admin
from firebase_admin import credentials, firestore

_SERVICE_ACCOUNT_PATH = os.environ.get(
    "FIREBASE_SERVICE_ACCOUNT_PATH", "../firebase/service-account.json"
)

if not firebase_admin._apps:
    if os.path.exists(_SERVICE_ACCOUNT_PATH):
        cred = credentials.Certificate(_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
    else:
        try:
            firebase_admin.initialize_app()
        except Exception as e:
            print(f"Warning: Firebase Admin initialized without service account: {e}")

try:
    db = firestore.client()
except Exception:
    db = None
