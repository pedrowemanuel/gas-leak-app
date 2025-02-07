import { SENSOR_AP_IP } from "@/constants/sensor-ap";
import { Command } from "@/types/command";
import { Alert } from "react-native";

export const submitWifiCredentials = async (credentials: WifiCredentials) => {
  try {
    const formData = new FormData();
    formData.append("ssid", credentials.ssid);
    formData.append("pass", credentials.pass);
    formData.append("ip", credentials.ip || "192.168.1.200");
    formData.append("gateway", credentials.gateway || "192.168.1.1");
    formData.append("websocketIP", credentials.websocketIP || "192.168.4.200");

    const response = await fetch(`http://${SENSOR_AP_IP}/`, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    return await response.text();
  } catch (error) {
    console.log("Falha ao enviar as credenciais" + String(error));

    return null;
  }
};

export const initCommunication = async (
  sensor: Sensor
): Promise<Response | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`http://${sensor.ip}/`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response;
  } catch (error) {
    return null;
  }
};

export const sendCommand = async (
  sensor: Sensor,
  command: Command
): Promise<Response | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`http://${sensor.ip}/${command}`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response;
  } catch (error) {
    Alert.alert(
      "Por favor, aguarde um momento e tente novamente",
      String(error)
    );
    return null;
  }
};

export const restartServer = async () => {
  try {
    await fetch(`http://${SENSOR_AP_IP}/restart`, {
      method: "GET",
    });
  } catch (error) {
    console.log("Falha" + String(error));
  }
};
