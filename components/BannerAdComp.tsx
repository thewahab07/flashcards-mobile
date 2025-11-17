import { useWords } from "@/context/globalContext";
import { useRef } from "react";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import admob from "../admob.json";
import { View } from "react-native";
type BannerAdCompProps = {
  onFail: () => void;
};
export default function BannerAdComp({ onFail }: BannerAdCompProps) {
  const { isOnline } = useWords();
  const bannerRef = useRef<BannerAd>(null);
  const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : admob.banner;

  //const adUnitId = TestIds.ADAPTIVE_BANNER;
  return (
    <>
      {isOnline ? (
        <View className="w-full h-[50px] justify-center items-center">
          <BannerAd
            ref={bannerRef}
            unitId={adUnitId}
            size={BannerAdSize.BANNER}
            onAdFailedToLoad={(e) => {
              onFail();
            }}
          />
        </View>
      ) : (
        <></>
      )}
    </>
  );
}
