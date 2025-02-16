interface WifiCredentials {
  ssid: string;
  pass: string;
  ip?: string;
  websocketIP?: string;
  telegramToken?: string;
}

interface Sensor {
  ssid: string;
  ip: string;
  websocketIP: string;
  lastCommunication: string;
  mac?: string;
  telegramToken?: string;
}
