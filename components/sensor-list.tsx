import { Colors } from "@/constants/colors";
import { router, useRouter } from "expo-router";
import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";

interface SensorListProps {
  sensors: Sensor[];
}

const SensorList: React.FC<SensorListProps> = ({ sensors }) => {
  const navigateToSensor = (sensor: Sensor) => {
    router.push({
      pathname: "/sensor-manager",
      params: { ...sensor },
    });
  };

  return (
    <FlatList
      data={sensors}
      keyExtractor={(item) => item.ip} // Usa o IP como chave única
      renderItem={({ item }) => (
        <Pressable onPress={() => navigateToSensor(item)}>
          <View style={styles.sensorItem}>
            <Text style={styles.ssid}>{item.ssid}</Text>
            <View>
              <Text style={styles.ip}>IP: {item.ip}</Text>
              <Text style={styles.lastComm}>
                Últ. comunicação:{" "}
                {new Date(item.lastCommunication).toLocaleString()}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  sensorItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    gap: 10,
  },
  ssid: {
    fontSize: 20,
    fontWeight: "semibold",
  },
  ip: {
    fontSize: 16,
    color: "gray",
  },
  lastComm: {
    fontSize: 14,
    color: Colors.primary,
  },
});

export default SensorList;
