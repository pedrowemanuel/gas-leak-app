import { SENSOR_AP_IP } from "@/constants/sensor-ap";
import { Command } from "@/types/command";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";

export const submitWifiCredentials = async (credentials: WifiCredentials) => {
  try {
    const formData = new FormData();
    formData.append("ssid", credentials.ssid);
    formData.append("pass", credentials.pass);
    formData.append("ip", credentials.ip || "192.168.1.200");
    formData.append("gateway", credentials.gateway || "192.168.1.1");

    const response = await fetch(`http://${SENSOR_AP_IP}/`, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    return await response.text();
  } catch (error) {
    Alert.alert("Falha ao enviar as credenciais", String(error));
    return null;
  }
};

export const sendCommand = async (
  sensor: Sensor,
  command: Command
): Promise<AxiosResponse<string> | null> => {
  try {
    const response = await axios.get(`http://${sensor.ip}/${command}`, {
      timeout: 10000,
    });

    return response;
  } catch (error) {
    Alert.alert("Falha ao enviar o comando", String(error));

    return null;
  }
};
