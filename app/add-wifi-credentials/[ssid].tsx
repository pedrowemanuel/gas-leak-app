import Input from "@/components/input";
import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import TetheringManager from "@react-native-tethering/wifi";

import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PASS_LAST_CONNECT_KEY,
  SSID_LAST_CONNECT_KEY,
} from "@/constants/storage-keys";
import { saveCredentials, saveSensor } from "@/services/data";
import {
  restartServer,
  submitWifiCredentials,
} from "@/services/sensor-web-server";

function getNumbersAfterColon(str: string) {
  const match = str.match(/:(\d+)/);
  return match ? match[1] : "200";
}

export default function AddWifiCredentials() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { ssid } = useLocalSearchParams<{ ssid: string }>();

  const [credentials, setCredentials] = useState<WifiCredentials>({
    ssid: "",
    pass: "",
    ip: `192.168.1.${getNumbersAfterColon(ssid)}`,
    websocketIP: `192.168.4.${getNumbersAfterColon(ssid)}`,
    telegramToken: "",
  });

  const route = useNavigation();
  const navigation = useRouter();

  const init = async () => {
    route.setOptions({ title: "Configure o sensor" });

    setState("ssid", (await AsyncStorage.getItem(SSID_LAST_CONNECT_KEY)) || "");
    setState("pass", (await AsyncStorage.getItem(PASS_LAST_CONNECT_KEY)) || "");

    setLoading(false);
  };

  const setState = (key: keyof WifiCredentials, value: string) => {
    setCredentials((prev) => {
      prev[key] = value;
      return { ...prev };
    });
  };

  const send = async () => {
    if (credentials.ssid === "" || credentials.pass === "") {
      Alert.alert(
        "Campos obrigatórios!",
        "Preencha os campos SSID e Senha para continuar."
      );
      return;
    }

    setTimeout(() => {
      setSending(true);
    });

    await saveCredentials(credentials);

    await TetheringManager.connectToLocalNetwork({
      ssid,
      password: "",
      isHidden: false,
    });

    const mac = await submitWifiCredentials(credentials);

    await restartServer();

    await saveSensor({
      ip: credentials.ip ?? "",
      ssid: ssid,
      lastCommunication: String(new Date()),
      mac: mac ?? "",
      websocketIP: credentials.websocketIP ?? "",
      telegramToken: credentials.telegramToken,
    });

    Alert.alert("Sensor salvo com sucesso", "MAC: " + mac, [
      { text: "OK", onPress: () => navigation.back() },
    ]);

    setSending(false);
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

            <Input
              label="IP"
              placeholder="192.168.1.[200-205]"
              value={credentials.ip}
              onChangeText={(text) => setState("ip", text)}
            />

            <Input
              label="Token Telegram Bot "
              placeholder="Digite aqui o token de acesso ao seu Bot Telegram ..."
              value={credentials.telegramToken}
              onChangeText={(text) => setState("telegramToken", text)}
            />
          </View>
          {sending ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <Button title="Enviar" onPress={send} />
          )}
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
