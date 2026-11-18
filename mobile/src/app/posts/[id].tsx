import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Post = {
  id: number;
  titulo: string;
  autor: string;
  conteudo: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  async function verificarLogin() {
    const token = await AsyncStorage.getItem("token");
    setAutenticado(!!token);
  }

  async function carregarPost() {
    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/posts/${id}`);

      if (!resposta.ok) {
        throw new Error("Erro ao buscar postagem");
      }

      const dados = await resposta.json();
      setPost(dados);
    } catch (error) {
      setPost(null);
      Alert.alert("Erro", "Não foi possível carregar a postagem.");
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      verificarLogin();
      carregarPost();
    }, [id]),
  );

  async function excluirPost() {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Atenção", "Faça login como professor.");
        router.push("/login");
        return;
      }

      const resposta = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir postagem");
      }

      Alert.alert("Sucesso", "Postagem excluída!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir a postagem.");
    }
  }

  function confirmarExclusao() {
    Alert.alert("Excluir postagem", "Deseja realmente excluir esta postagem?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: excluirPost,
      },
    ]);
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centralizado}>
        <Text>Postagem não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{post.titulo}</Text>

      <Text style={styles.autor}>Por {post.autor}</Text>

      <Text style={styles.conteudo}>{post.conteudo}</Text>

      {autenticado && (
        <>
          <Pressable
            style={styles.botaoEditar}
            onPress={() => router.push(`/posts/edit/${id}`)}
          >
            <Text style={styles.textoBotao}>Editar postagem</Text>
          </Pressable>

          <Pressable style={styles.botaoExcluir} onPress={confirmarExclusao}>
            <Text style={styles.textoBotao}>Excluir postagem</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 12,
  },
  autor: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  conteudo: {
    fontSize: 17,
    lineHeight: 26,
    color: "#1e293b",
    marginBottom: 24,
  },
  botaoEditar: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  botaoExcluir: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
