import {
  PASS_LAST_CONNECT_KEY,
  SAVED_SENSORS_KEY,
  SSID_LAST_CONNECT_KEY,
} from "@/constants/storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const saveCredentials = async (credentials: WifiCredentials) => {
  try {
    await AsyncStorage.setItem(SSID_LAST_CONNECT_KEY, credentials.ssid);
    if (credentials.pass !== "") {
      await AsyncStorage.setItem(PASS_LAST_CONNECT_KEY, credentials.pass);
    }
  } catch (e) {
    Alert.alert("Ocorreu um problema ao salvar as credenciais", String(e));
  }
};

export const getSensors = async (): Promise<Sensor[]> => {
  const sensors = await AsyncStorage.getItem(SAVED_SENSORS_KEY);

  if (sensors) {
    try {
      return JSON.parse(sensors) as Sensor[];
    } catch (e) {
      Alert.alert("Erro ao converter sensores:", String(e));
    }
  }

  return [];
};

export const saveSensor = async (sensor: Sensor) => {
  try {
    const sensors = await getSensors();
    const updatedSensors = [...sensors, sensor];

    await AsyncStorage.setItem(
      SAVED_SENSORS_KEY,
      JSON.stringify(updatedSensors)
    );
  } catch (e) {
    Alert.alert("Ocorreu um problema ao salvar o sensor", String(e));
  }
};

export const removeSensor = async (sensorIp: string) => {
  try {
    const sensors = await AsyncStorage.getItem(SAVED_SENSORS_KEY);
    if (!sensors) return;

    const parsedSensors = JSON.parse(sensors);
    const updatedSensors = parsedSensors.filter(
      (sensor: { ip: string }) => sensor.ip !== sensorIp
    );

    await AsyncStorage.setItem(
      SAVED_SENSORS_KEY,
      JSON.stringify(updatedSensors)
    );
  } catch (e) {
    Alert.alert("Ocorreu um problema ao remover o sensor", String(e));
  }
};
