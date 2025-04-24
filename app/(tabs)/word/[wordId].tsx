// app/word/[wordId].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function RedirectWord() {
  const { wordId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (wordId) {
      router.replace({ pathname: "/", params: { wordId } });
    } else {
      router.replace("/");
    }
  }, [wordId]);

  return null; // optional: add a loading spinner if you want
}
