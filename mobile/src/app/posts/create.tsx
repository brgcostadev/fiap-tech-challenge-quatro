import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreatePostScreen() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function verificarAcesso() {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/login");
      }
    }

    verificarAcesso();
  }, []);

  async function criarPost() {
    if (!titulo.trim() || !autor.trim() || !conteudo.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setSalvando(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Atenção", "Faça login como professor.");
        router.push("/login");
        return;
      }

      const resposta = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          autor,
          conteudo,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao criar postagem");
      }

      Alert.alert("Sucesso", "Postagem criada!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar a postagem.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nova postagem</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={styles.input}
        placeholder="Autor"
        value={autor}
        onChangeText={setAutor}
      />

      <TextInput
        style={[styles.input, styles.conteudo]}
        placeholder="Conteúdo da postagem"
        value={conteudo}
        onChangeText={setConteudo}
        multiline
      />

      <Pressable style={styles.botao} onPress={criarPost} disabled={salvando}>
        <Text style={styles.textoBotao}>
          {salvando ? "Publicando..." : "Publicar"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    color: "#1e293b",
  },
  conteudo: {
    height: 160,
    textAlignVertical: "top",
  },
  botao: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
