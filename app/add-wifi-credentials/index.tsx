import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, View } from "react-native";
import WifiManager from "react-native-wifi-reborn";

export default function AddWifiCredentials() {
  const [currentSSID, setCurrentSSID] = useState("");
  const router = useNavigation();

  const getCredentials = async () => {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      return ssid;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const init = async () => {
    router.setOptions({ title: "Adicione uma rede Wi-fi" });

    setCurrentSSID(await getCredentials());
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "100%",
          gap: 15,
        }}
      >
        <View style={styles.box}>
          <Text
            style={{ fontSize: 16, fontWeight: "400", color: Colors.primary }}
          >
            Rede Wi-fi conectada
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "200" }}>
            {currentSSID || "Sem conexão"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  box: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    height: 100,
    padding: 15,
    gap: 2,
  },
});
