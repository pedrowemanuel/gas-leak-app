import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { SSID_PREFIX } from "@/constants/sensor-ap";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View,
} from "react-native";
import { PermissionsAndroid } from "react-native";
import WifiManager from "react-native-wifi-reborn";
import TetheringManager from "@react-native-tethering/wifi";

import { router, useFocusEffect, useRouter } from "expo-router";
import { getSensors, saveCredentials } from "@/services/data";
import SensorList from "@/components/sensor-list";

export default function Index() {
  const [locationGrated, setLocationGrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [currentSSID, setCurrentSSID] = useState("");
  const [currentIP, setCurrentIP] = useState("");
  const logs = useRef("");

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

  const navigateToAddCredentialsScreen = (ssid: string) => {
    setTimeout(() => {
      setLoading(false);
    });

    router.push(`/add-wifi-credentials/${ssid}`);
  };

  const searchSensor = async (time: number = 30000) => {
    if (time <= 0) {
      setLoading(false);

      Alert.alert("Nenhum dispositivo encontrado", logs.current, [
        {
          onPress() {
            setLoading(false);
          },
        },
      ]);

      return;
    }

    const ssidConnect = await getCurrentSSID();

    if (ssidConnect.includes(SSID_PREFIX)) {
      navigateToAddCredentialsScreen(ssidConnect);
      return;
    }

    setTimeout(() => {
      setLoading(true);
    });

    try {
      const networks = await TetheringManager.getWifiNetworks();

      const network = networks.find((network) =>
        network.ssid.includes(SSID_PREFIX)
      );

      if (network) {
        navigateToAddCredentialsScreen(network.ssid);

        return;
      }

      setTimeout(() => {
        searchSensor(time - 1000);
      }, 1000);
    } catch (error) {
      console.log(error);
      logs.current = logs.current + "\n" + String(error);

      setTimeout(() => {
        searchSensor(time - 1000);
      }, 1000);
    }
  };

  const getCurrentSSID = async () => {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      if (!ssid) {
        TetheringManager.openWifiSettings(true);

        return await WifiManager.getCurrentWifiSSID();
      }

      return ssid;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const getCurrentIP = async () => {
    try {
      const ip = await WifiManager.getIP();

      return ip;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const initApp = async () => {
    const granted = await requestLocationPermission();

    setLocationGrated(granted);

    if (granted) {
      const ssid = await getCurrentSSID();
      const ip = await getCurrentIP();

      setCurrentSSID(ssid);
      setCurrentIP(ip);

      if (ssid !== "" && !ssid.includes(SSID_PREFIX)) {
        saveCredentials({ ssid, pass: "" });
      }
    }

    setSensors(await getSensors());
  };

  useFocusEffect(
    useCallback(() => {
      console.log("A tela foi focada!");

      initApp();
    }, [])
  );

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
          <Text
            style={{
              fontSize: 18,
              fontWeight: "200",
              color: Colors.primary,
              fontStyle: "italic",
            }}
          >
            IP: {currentIP || ""}
          </Text>
        </View>

        <View style={styles.box}>
          <Text
            style={{ fontSize: 16, fontWeight: "400", color: Colors.primary }}
          >
            Sensores salvos
          </Text>
          <SensorList sensors={sensors} />
        </View>
      </View>

      <Button
        title="Procurar sensor"
        onPress={async () => {
          logs.current = "";

          await searchSensor();
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
    minHeight: 100,
    padding: 15,
    gap: 2,
  },
});
