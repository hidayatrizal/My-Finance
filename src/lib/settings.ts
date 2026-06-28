import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ServicePrices } from "../types";

const SETTINGS_DOC_ID = "prices";
const SETTINGS_COLLECTION = "settings";

export const getPrices = async (): Promise<ServicePrices> => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as ServicePrices;
  } else {
    // Default prices if not set
    const defaultPrices: ServicePrices = { adult: 35000, child: 25000 };
    await setDoc(docRef, defaultPrices);
    return defaultPrices;
  }
};

export const updatePrices = async (prices: ServicePrices): Promise<void> => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(docRef, prices, { merge: true });
};
