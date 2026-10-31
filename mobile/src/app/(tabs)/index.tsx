import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Post = {
  id: number;
  titulo: string;
  conteudo: string;
  autor: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPosts() {
      try {
        if (!API_URL) {
          throw new Error("EXPO_PUBLIC_API_URL não configurada");
        }

        const resposta = await fetch(`${API_URL}/posts`);

        if (!resposta.ok) {
          throw new Error("Erro ao buscar postagens");
        }

        const dados: Post[] = await resposta.json();
        setPosts(dados);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setCarregando(false);
      }
    }

    carregarPosts();
  }, []);

  const postsFiltrados = posts.filter((post) => {
    const termo = busca.toLowerCase();

    return (
      post.titulo.toLowerCase().includes(termo) ||
      post.conteudo.toLowerCase().includes(termo) ||
      post.autor.toLowerCase().includes(termo)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Blog Educacional</Text>

      <TextInput
        style={styles.busca}
        placeholder="Buscar postagens..."
        value={busca}
        onChangeText={setBusca}
      />

      {carregando ? (
        <ActivityIndicator size="large" />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <FlatList
          data={postsFiltrados}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text>Nenhuma postagem encontrada.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/posts/${item.id}`)}
            >
              <Text style={styles.postTitulo}>{item.titulo}</Text>

              <Text style={styles.autor}>Por {item.autor}</Text>

              <Text numberOfLines={3} style={styles.conteudo}>
                {item.conteudo}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
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
    marginBottom: 20,
    color: "#172554",
  },
  busca: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },
  postTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  autor: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
  },
  conteudo: {
    fontSize: 14,
    color: "#475569",
    marginTop: 10,
  },
  erro: {
    color: "#dc2626",
    textAlign: "center",
  },
});
