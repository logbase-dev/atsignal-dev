// TODO: Firestore 연동 구현
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getMenusByLocale(locale: string) {
  // TODO: 실제 Firestore 연동
  // const menusRef = collection(db, "menus");
  // const q = query(
  //   menusRef,
  //   where("locale", "==", locale),
  //   orderBy("order", "asc")
  // );
  // 
  // const querySnapshot = await getDocs(q);
  // return querySnapshot.docs.map((doc) => ({
  //   id: doc.id,
  //   ...doc.data(),
  // }));
  
  return [];
}

