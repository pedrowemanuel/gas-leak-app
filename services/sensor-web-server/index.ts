import { SENSOR_AP_IP } from "@/constants/sensor-ap";
import axios, { AxiosResponse } from "axios";

interface WifiCredentials {
  ssid: string;
  pass: string;
  ip?: string;
  gateway?: string;
}

const submitWifiCredentials = async (
  credentials: WifiCredentials
): Promise<AxiosResponse<string> | null> => {
  try {
    const response = await axios.post(`http://${SENSOR_AP_IP}`, {
      ssid: credentials.ssid,
      pass: credentials.pass,
      ip: credentials.ip || "192.168.1.200",
      gateway: credentials.gateway || "192.168.1.1",
    });

    return response;
  } catch (error) {
    console.error("Error submitting WiFi credentials:", error);

    return null;
  }
};

export default submitWifiCredentials;
