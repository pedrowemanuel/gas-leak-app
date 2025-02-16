import Input from "@/components/input";
import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { removeSensor, updateSensor } from "@/services/data";
import { Command } from "@/types/command";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import TetheringManager from "@react-native-tethering/wifi";

export default function SensorManager() {
  const [connecting, setConnecting] = useState(true);
  const [isconnected, setIsConnected] = useState(false);
  const [sensor, setSensor] = useState<Sensor>({} as Sensor);
  const [ws, setWs] = useState<WebSocket>();
  const [responseSensor, setResponseSensor] = useState("");

  const route = useNavigation();
  const params = useLocalSearchParams<{
    ssid: string;
    ip: string;
    websocketIP: string;
    lastCommunication: string;
    mac?: string;
  }>();
  const navigation = useRouter();

  const init = async () => {
    route.setOptions({ title: "Sensor: " + params.ssid });

    setSensor({ ...params });

    try {
      await TetheringManager.connectToLocalNetwork({
        ssid: params.ssid,
        password: "",
        isHidden: false,
      });

      setTimeout(() => {
        const websocket = new WebSocket(`ws://${params.websocketIP}:81`);

        websocket.onopen = async () => {
          console.log("✅ Conectado ao WebSocket do ESP32!");

          await updateSensor({
            ...sensor,
            lastCommunication: String(new Date()),
          });

          setIsConnected(true);
        };

        websocket.onmessage = (event) => {
          console.log("Mensagem do ESP32:", event.data);

          if (event.data === "0") {
            Alert.alert(
              "Alarme disparado!",
              "Sensor detectou um vazamento de gás!"
            );
          } else {
            setResponseSensor(event.data);
          }
        };

        websocket.onerror = (error: any) => {
          Alert.alert("Erro no WebSocket:", String(error?.message));

          setConnecting(false);
        };

        websocket.onclose = () => {
          Alert.alert("WebSocket desconectado!");

          setIsConnected(false);
        };

        setWs(websocket);
      }, 1000);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const exit = async () => {
    try {
      ws?.close();

      await TetheringManager.disconnectFromLocalNetwork();
    } catch (error) {}
  };

  const send = async (command: Command) => {
    if (!ws) {
      return;
    }

    ws.send(command);
  };

  useEffect(() => {
    setConnecting(false);
  }, [isconnected]);

  useEffect(() => {
    init();

    return () => {
      exit();
    };
  }, []);

  if (!sensor) {
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
    <ScrollView>
      <View style={styles.container}>
        <View
          style={{
            width: "100%",
            gap: 15,
          }}
        >
          <View style={styles.box}>
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>SSID</Text>
                <Text style={{ fontSize: 24, fontWeight: "200" }}>
                  {sensor.ssid}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>IP</Text>
                <Text style={{ fontSize: 24, fontWeight: "200" }}>
                  {sensor.ip}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>MAC</Text>
                <Text style={{ fontSize: 24, fontWeight: "200" }}>
                  {sensor.mac}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>IP do WebSocket</Text>
                <Text style={{ fontSize: 24, fontWeight: "200" }}>
                  {sensor.websocketIP}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>Últ. comunicação</Text>
                <Text style={{ fontSize: 24, fontWeight: "200" }}>
                  {new Date(sensor.lastCommunication).toLocaleString()}
                </Text>
              </View>

              {responseSensor !== "" && (
                <View>
                  <Text style={styles.label}>Mensagem recebida</Text>
                  <Text style={{ fontSize: 24, fontWeight: "400" }}>
                    {responseSensor}
                  </Text>
                </View>
              )}
            </View>
            {connecting ? (
              <View style={{ gap: 15 }}>
                <Text>Conectando ...</Text>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : (
              <View style={{ width: "100%", marginTop: 45, gap: 15 }}>
                {isconnected && (
                  <View style={{ gap: 15 }}>
                    <Button
                      title="Simular alarme"
                      onPress={() => send(Command.ON)}
                    />
                    <Button
                      title="Desligar alarme"
                      onPress={() => send(Command.OFF)}
                    />
                    <Button
                      title="Resetar"
                      onPress={async () => {
                        await send(Command.RESET);
                      }}
                      color="#FC4F49"
                    />
                  </View>
                )}

                <Button
                  title="Apagar"
                  onPress={async () => {
                    await removeSensor(sensor.ip);

                    navigation.back();
                  }}
                  color="#FC4F49"
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
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
    minHeight: 600,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.primary,
  },
});
