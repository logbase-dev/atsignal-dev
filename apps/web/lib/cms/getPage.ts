// TODO: Firestore 연동 구현
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getPageBySlug(slug: string, locale: string) {
  // TODO: 실제 Firestore 연동
  // const pageRef = doc(db, "pages", `${locale}/${slug}`);
  // const pageSnap = await getDoc(pageRef);
  // 
  // if (!pageSnap.exists()) {
  //   return null;
  // }
  // 
  // return {
  //   id: pageSnap.id,
  //   ...pageSnap.data(),
  // };
  
  return null;
}

