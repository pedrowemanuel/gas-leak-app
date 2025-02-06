interface WifiCredentials {
  ssid: string;
  pass: string;
  ip?: string;
  gateway?: string;
}

interface Sensor {
  ssid: string;
  ip: string;
  lastCommunication: string;
  mac?: string;
}
