import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { SSID_PREFIX } from "@/constants/sensor-ap";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, View } from "react-native";
import { PermissionsAndroid } from "react-native";
import WifiManager from "react-native-wifi-reborn";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SSID_LAST_CONNECT_KEY } from "@/constants/storage-keys";

export default function Index() {
  const [locationGrated, setLocationGrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelSearch, setCancelSearch] = useState(false);
  const [currentSSID, setCurrentSSID] = useState("");
  const router = useRouter();

  const requestLocationPermission = async () => {
    const permissionLocation = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (!permissionLocation) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permissão de localização é necessária para conexões Wi-Fi",
          message:
            "Este aplicativo precisa de permissão de localização, pois isso é necessário para escanear redes Wi-Fi.",
          buttonNegative: "NEGAR",
          buttonPositive: "PERMITIR",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    return true;
  };

  const searchSensor = async (time: number = 30000) => {
    console.log({ time });

    if (time <= 0) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(true);
    });

    try {
      // await WifiManager.connectToProtectedSSIDPrefix(SSID_PREFIX, "", true);

      const ssidConnect = await getCredentials();
      if (ssidConnect.includes(SSID_PREFIX)) {
        console.log(ssidConnect);

        setTimeout(() => {
          setLoading(false);
        });

        router.push("/add-wifi-credentials");
      }
    } catch (error) {
      console.log(error);

      setTimeout(() => {
        searchSensor(time - 1000);
      }, 1000);
    }
  };

  const getCredentials = async () => {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      return ssid;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const saveCredentials = async (ssid: string) => {
    try {
      await AsyncStorage.setItem(SSID_LAST_CONNECT_KEY, ssid);
      console.log({ ssid });
    } catch (e) {
      console.log(e);
    }
  };

  const initApp = async () => {
    const granted = await requestLocationPermission();

    setLocationGrated(granted);

    if (granted) {
      const ssid = await getCredentials();

      setCurrentSSID(ssid);

      if (ssid !== "" && !ssid.includes(SSID_PREFIX)) {
        saveCredentials(ssid);
      }
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <Text>Buscando ...</Text>
          <ActivityIndicator size="large" color={Colors.primary} />
          {/* <Button
            title="Cancelar"
            onPress={() => {
              setTimeout(() => {
                setCancelSearch(true);
              });
            }}
          /> */}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {!locationGrated && (
        <Text>
          Este aplicativo precisa de permissão de localização, pois isso é
          necessário para escanear redes Wi-Fi.
        </Text>
      )}

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

        <View style={styles.box}>
          <Text
            style={{ fontSize: 16, fontWeight: "400", color: Colors.primary }}
          >
            Sensores salvos
          </Text>
        </View>
      </View>

      <Button
        title="Procurar sensor"
        onPress={() => {
          setCancelSearch(false);

          searchSensor();
        }}
      />
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
