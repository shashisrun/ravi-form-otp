
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, getDocs, serverTimestamp, onSnapshot, where, query, documentId, deleteField } from "firebase/firestore";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";

const firebaseConfig = {
    
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// forBrowser
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}
// const analytics = getAnalytics(app);
const auth = getAuth();
auth.languageCode = 'en';

function setUpRecaptcha(phone) {
    const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {size: 'invisible'});
    recaptcha.render();
    return signInWithPhoneNumber(auth, phone, recaptcha);
}

async function addDocument(database, data) {
    try {
        const response = await addDoc(collection(db, database), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        const resdata = await getDoc(response)
        return { ...resdata.data(), id: response.id }
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function addNamedDocument(database, data, name) {
    try {
        await setDoc(doc(db, database, name), {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function getDocument(database, name) {
    const docRef = doc(db, database, name);
    const docSnap = await getDoc(docRef, { includeMetadataChanges: true });
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

async function getDocuments(database, whereQuery) {
    const dataArray = [];
    let querySnapshot;
    if (whereQuery) {
        const queries = query(collection(db, database), whereQuery);
        querySnapshot = await getDocs(queries);
    } else {
        querySnapshot = await getDocs(collection(db, database), { includeMetadataChanges: true });
    }
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        const data = doc.data();
        dataArray.push({ ...data, id: doc.id });
    });
    return dataArray;
}

function subscribe(database, subscribeFn) {
    onSnapshot(collection(db, database), { includeMetadataChanges: true }, (querySnapshot) => {
        const dataArray = [];
        querySnapshot.docs.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            const data = doc.data();
            dataArray.push({ ...data, id: doc.id });
        });
        subscribeFn(dataArray)
    });
}

function createRef(path, data) {
    const ref = doc(db, path, data)
    return ref;
}

async function getRef(ref) {
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

async function updateDocument(database, data, name) {
    try {
        await setDoc(doc(db, database, name), {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

async function deleteDocument(database, data, name) {
    const response = await setDoc(doc(db, database, name), {
        ...data
    });
    return response;
}

async function uploadFile(path, file) {
    const fullname = file.name.split('.');
    const name = fullname[0];
    const extension = fullname[1];
    const filepath = `${path}/${name}-${Date.now()}.${extension}`;
    const fileRef = ref(storage, filepath)
    await uploadBytes(fileRef, file);
    return filepath;
}

async function getFile(path) {
    try {
        const fileRef = ref(storage, path);
        const downloadUrl = await getDownloadURL(fileRef);
        return downloadUrl;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

async function deleteFile(path) {
    const fileRef = ref(storage, path);
    deleteObject(fileRef).then(() => {
        return true;
    }).catch((error) => {
        console.error(error.message);
        return false;
    });
}


export {
    app,
    auth,
    setUpRecaptcha,
    addDocument,
    addNamedDocument,
    getDocument,
    getDocuments,
    uploadFile,
    updateDocument,
    getFile,
    deleteFile,
    createRef,
    subscribe,
    getRef,
    analytics,
    serverTimestamp,
    where,
    documentId,
    deleteField
};