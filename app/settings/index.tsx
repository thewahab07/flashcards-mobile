import { View } from "react-native";
import Notifications from "@/components/settings/notifications";
import { ScrollView } from "react-native-gesture-handler";
import Theme from "@/components/settings/theme";
import ImportExport from "@/components/settings/import-export";
import About from "@/components/settings/about";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";
import { useWords } from "@/context/globalContext";
type PendingAction = {
  type: "theme" | "import" | "export";
  payload?: any;
};

export default function SettingsScreen() {
  const { isOnline } = useWords();
  const rewardedInterstitialId =
    Constants.expoConfig?.extra?.admobRewardedInterstitialId;
  const adUnitId = __DEV__
    ? TestIds.REWARDED_INTERSTITIAL
    : rewardedInterstitialId;
  const adRef = useRef<RewardedInterstitialAd | null>(null);
  const [loadingAd, setLoadingAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const callbacksRef = useRef<{
    onReward?: () => void;
    onClose?: () => void;
  }>({});
  useEffect(() => {
    if (!isOnline) return;
    const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
      adUnitId,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );
    adRef.current = rewardedInterstitial;
    let rewardEarned = false;
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoadingAd(false);
        if (adRef.current) {
          adRef.current.show();
        }
      }
    );
    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardEarned = true;
      }
    );
    const unsubscribeClosed = rewardedInterstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (rewardEarned && callbacksRef.current.onReward) {
          callbacksRef.current.onReward();
        } else if (callbacksRef.current.onClose) {
          callbacksRef.current.onClose();
        }
        setLoadingAd(false);
        setPendingAction(null);
        callbacksRef.current = {};
        rewardEarned = false;
      }
    );
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [isOnline]);
  const requestAdAction = useCallback(
    (action: PendingAction, onReward: () => void, onClose?: () => void) => {
      if (!isOnline) {
        onReward();
        return;
      }
      setPendingAction(action);
      callbacksRef.current = { onReward, onClose };
      setLoadingAd(true);

      // Load ad after setting up callbacks
      if (adRef.current) {
        adRef.current.load();
      }
    },
    [isOnline]
  );
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="w-full h-full px-6"
    >
      <View className="w-full items-center my-4">
        <Notifications />
        <Theme
          requestAdAction={requestAdAction}
          isLoadingAd={loadingAd && pendingAction?.type === "theme"}
          currentPendingPayload={
            pendingAction?.type === "theme" ? pendingAction.payload : null
          }
        />
        <ImportExport
          requestAdAction={requestAdAction}
          isLoadingAd={loadingAd && pendingAction?.type !== "theme"}
          currentPendingAction={
            pendingAction?.type !== "theme" ? pendingAction?.type : null
          }
        />
        <About />
      </View>
    </ScrollView>
  );
}
