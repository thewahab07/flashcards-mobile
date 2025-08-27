import { useWords } from "@/context/globalContext";
import { useRef } from "react";
import Constants from "expo-constants";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
export default function BannerAdComp() {
  const { isOnline } = useWords();
  const bannerId = Constants.expoConfig?.extra?.admobBannerId;
  const bannerRef = useRef<BannerAd>(null);
  //const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : bannerId;
  const adUnitId = TestIds.ADAPTIVE_BANNER;
  return (
    <>
      {isOnline ? (
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      ) : (
        <></>
      )}
    </>
  );
}
