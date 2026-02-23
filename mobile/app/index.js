
import { StyleSheet, Text, View, Button } from "react-native";
import React, { useState } from "react";
import MenteesScreen from "./MenteesScreen";


export default function Page() {
  const [showMentees, setShowMentees] = useState(false);
  if (showMentees) return <MenteesScreen />;
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
        <Button title="Show Mentees" onPress={() => setShowMentees(true)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
