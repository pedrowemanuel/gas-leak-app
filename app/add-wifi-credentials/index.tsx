import Input from "@/components/input";
import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View,
} from "react-native";
import WifiManager from "react-native-wifi-reborn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PASS_LAST_CONNECT_KEY,
  SSID_LAST_CONNECT_KEY,
} from "@/constants/storage-keys";
import submitWifiCredentials from "@/services/sensor-web-server";

interface WifiCredentials {
  ssid: string;
  pass: string;
}

export default function AddWifiCredentials() {
  const [currentSSID, setCurrentSSID] = useState("");
  const [loading, setLoading] = useState(true);

  const [credentials, setCredentials] = useState<WifiCredentials>({
    ssid: "",
    pass: "",
  });

  const route = useNavigation();
  const navigation = useRouter();

  const getCurrentCredentials = async () => {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      return ssid;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const init = async () => {
    route.setOptions({ title: "Adicione uma rede Wi-fi" });

    console.log(await AsyncStorage.getItem(SSID_LAST_CONNECT_KEY));

    setState("ssid", (await AsyncStorage.getItem(SSID_LAST_CONNECT_KEY)) || "");
    setState("pass", (await AsyncStorage.getItem(PASS_LAST_CONNECT_KEY)) || "");

    setCurrentSSID(await getCurrentCredentials());

    setLoading(false);
  };

  const setState = (key: keyof WifiCredentials, value: string) => {
    setCredentials((prev) => {
      prev[key] = value;
      return { ...prev };
    });
  };

  const saveCredentials = async (credentials: WifiCredentials) => {
    try {
      await AsyncStorage.setItem(SSID_LAST_CONNECT_KEY, credentials.ssid);
      await AsyncStorage.setItem(PASS_LAST_CONNECT_KEY, credentials.pass);

      console.log("Saved credentials success!");
    } catch (e) {
      console.log(e);
    }
  };

  const send = async () => {
    if (credentials.ssid === "" || credentials.pass === "") {
      Alert.alert(
        "Campos obrigatórios!",
        "Preencha os campos SSID e Senha para continuar."
      );
      return;
    }

    await saveCredentials(credentials);

    const response = await submitWifiCredentials(credentials);

    if (response !== null && response.status === 200) {
      Alert.alert("Sensor configurado com sucesso", "IP: " + response.data, [
        { text: "OK", onPress: () => navigation.back() },
      ]);
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <Text>Carregando ...</Text>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

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
            style={{ fontSize: 20, fontWeight: "400", color: Colors.primary }}
          >
            Informe as credenciais da rede
          </Text>
          <View style={styles.form}>
            <Input
              label="SSID*"
              placeholder="Digite aqui ..."
              value={credentials.ssid}
              onChangeText={(text) => setState("ssid", text)}
            />
            <Input
              label="Senha*"
              placeholder="Digite aqui ..."
              secureTextEntry
              value={credentials.pass}
              onChangeText={(text) => setState("pass", text)}
            />
          </View>
          <Button title="Enviar" onPress={send} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    minHeight: 400,
    justifyContent: "space-between",
  },
  form: {
    gap: 10,
  },
});
