import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Post = {
  id: number;
  titulo: string;
  autor: string;
  conteudo: string;
};

export default function PostagensScreen() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  async function carregarPosts() {
    try {
      setCarregando(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setAutenticado(false);
        router.replace("/login");
        return;
      }

      const resposta = await fetch(`${API_URL}/posts`);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar postagens");
      }

      const dados = await resposta.json();
      setPosts(dados);
      setAutenticado(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar postagens.");
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarPosts();
    }, []),
  );

  function excluirPost(id: number) {
    Alert.alert("Excluir postagem", "Deseja realmente excluir esta postagem?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");

            if (!token) {
              router.replace("/login");
              return;
            }

            const resposta = await fetch(`${API_URL}/posts/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (resposta.status === 401) {
              await AsyncStorage.removeItem("token");
              router.replace("/login");
              return;
            }

            if (!resposta.ok) {
              throw new Error("Erro ao excluir");
            }

            await carregarPosts();

            Alert.alert("Sucesso", "Postagem excluída!");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  }

  if (carregando) {
    return <ActivityIndicator size="large" color="#2563eb" />;
  }

  if (!autenticado) {
    return (
      <View style={styles.container}>
        <Text>Não foi possível acessar o painel.</Text>
        <Pressable style={styles.botao} onPress={carregarPosts}>
          <Text style={styles.textoBotao}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciar postagens</Text>

      <Pressable
        style={styles.botao}
        onPress={() => router.push("/posts/create")}
      >
        <Text style={styles.textoBotao}>+ Nova postagem</Text>
      </Pressable>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>Nenhuma postagem cadastrada.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.titulo}</Text>
            <Text style={styles.autor}>{item.autor}</Text>

            <Text style={styles.conteudo} numberOfLines={2}>
              {item.conteudo}
            </Text>

            <View style={styles.acoes}>
              <Pressable
                style={styles.editar}
                onPress={() => router.push(`/posts/edit/${item.id}`)}
              >
                <Text style={styles.textoBotao}>Editar</Text>
              </Pressable>

              <Pressable
                style={styles.excluir}
                onPress={() => excluirPost(item.id)}
              >
                <Text style={styles.textoBotao}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 20,
  },
  botao: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  nome: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#172554",
  },
  autor: {
    color: "#64748b",
    marginBottom: 8,
  },
  conteudo: {
    color: "#334155",
    marginBottom: 16,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
  },
  editar: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
  },
  excluir: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
