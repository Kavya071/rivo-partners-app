import { router } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import Icon from "@/components/Icon";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={40} color={Colors.textMuted} />
      <Text style={styles.title}>Page not found</Text>
      <Pressable
        onPress={() => router.replace("/")}
        style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.linkText}>Go home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  link: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
});
