import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AdminScreen() {
  const router = useRouter();

  const [autenticado, setAutenticado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function verificarLogin() {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        setAutenticado(true);
      }

      setAutenticado(false);
      verificarLogin();
    }, [router]),
  );

  if (!autenticado) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Painel Administrativo</Text>

      <Pressable
        style={styles.botao}
        onPress={() => router.push("/professores")}
      >
        <Text style={styles.texto}>Gerenciar professores</Text>
      </Pressable>

      <Pressable style={styles.botao} onPress={() => router.push("/alunos")}>
        <Text style={styles.texto}>Gerenciar alunos</Text>
      </Pressable>

      <Pressable style={styles.botao} onPress={() => router.push("/postagens")}>
        <Text style={styles.texto}>Gerenciar postagens</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f5f7fb",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 24,
  },
  botao: {
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 10,
    marginBottom: 16,
  },
  texto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
