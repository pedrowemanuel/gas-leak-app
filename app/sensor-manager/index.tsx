import Input from "@/components/input";
import { Text } from "@/components/text";
import { Colors } from "@/constants/colors";
import { removeSensor, updateSensor } from "@/services/data";
import { initCommunication, sendCommand } from "@/services/sensor-web-server";
import { Command } from "@/types/command";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View,
} from "react-native";

export default function SensorManager() {
  const [sending, setSending] = useState(false);

  const [sensor, setSensor] = useState<Sensor>({} as Sensor);

  const route = useNavigation();
  const params = useLocalSearchParams();
  const navigation = useRouter();

  const init = async () => {
    route.setOptions({ title: "Sensor: " + params.ssid });
    // @ts-ignore
    setSensor({ ...params });
  };

  const setState = (key: keyof Sensor, value: string) => {
    setSensor((prev) => {
      prev[key] = value;
      return { ...prev };
    });
  };

  const send = async (command: Command) => {
    setTimeout(() => {
      setSending(true);
    });

    await initCommunication(sensor);

    const response = await sendCommand(sensor, command);

    if (response) {
      await updateSensor({ ...sensor, lastCommunication: String(new Date()) });
    }

    setSending(false);
  };

  useEffect(() => {
    init();
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
              <Text style={{ fontSize: 28, fontWeight: "200" }}>
                {sensor.ssid}
              </Text>
            </View>

            <View>
              <Text style={styles.label}>IP</Text>
              <Text style={{ fontSize: 28, fontWeight: "200" }}>
                {sensor.ip}
              </Text>
            </View>

            <View>
              <Text style={styles.label}>MAC</Text>
              <Text style={{ fontSize: 28, fontWeight: "200" }}>
                {sensor.mac}
              </Text>
            </View>

            <View>
              <Text style={styles.label}>Últ. comunicação</Text>
              <Text style={{ fontSize: 28, fontWeight: "200" }}>
                {new Date(sensor.lastCommunication).toLocaleString()}
              </Text>
            </View>
          </View>
          {sending ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <View style={{ gap: 15 }}>
              <Button title="Simular alarme" onPress={() => send(Command.ON)} />
              <Button
                title="Desligar alarme"
                onPress={() => send(Command.OFF)}
              />
              <Button
                title="Resetar / apagar"
                onPress={async () => {
                  await send(Command.RESET);

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
    fontSize: 18,
    fontWeight: "400",
    color: Colors.primary,
  },
});
