interface WifiCredentials {
  ssid: string;
  pass: string;
  ip?: string;
  gateway?: string;
  websocketIP?: string;
}

interface Sensor {
  ssid: string;
  ip: string;
  websocketIP: string;
  lastCommunication: string;
  mac?: string;
}
