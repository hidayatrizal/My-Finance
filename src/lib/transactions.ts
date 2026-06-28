import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "../types";

const TRANSACTIONS_COLLECTION = "transactions";

export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transaction);
  return docRef.id;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    orderBy("date", "desc"),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];
  
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  
  return transactions;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
};
