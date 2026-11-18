import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditPostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function verificarAcesso() {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/login");
      }
    }

    verificarAcesso();
  }, []);

  // Buscar os dados da postagem
  useEffect(() => {
    async function carregarPost() {
      try {
        const resposta = await fetch(`${API_URL}/posts/${id}`);

        if (!resposta.ok) {
          throw new Error("Erro ao buscar postagem");
        }

        const dados = await resposta.json();

        setTitulo(dados.titulo);
        setAutor(dados.autor);
        setConteudo(dados.conteudo);
      } catch (error) {
        setErro("Não foi possível carregar a postagem.");
      } finally {
        setCarregando(false);
      }
    }

    if (id) {
      carregarPost();
    }
  }, [id]);

  // Atualizar a postagem
  async function editarPost() {
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

      const resposta = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
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
        throw new Error("Erro ao atualizar postagem");
      }

      Alert.alert("Sucesso", "Postagem atualizada!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a postagem.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar postagem</Text>

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

      <Pressable style={styles.botao} onPress={editarPost} disabled={salvando}>
        <Text style={styles.textoBotao}>
          {salvando ? "Salvando..." : "Salvar alterações"}
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
  erro: {
    color: "#dc2626",
    textAlign: "center",
  },
});
