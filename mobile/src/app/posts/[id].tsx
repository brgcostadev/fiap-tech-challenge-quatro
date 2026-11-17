import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

type Post = {
  id: number;
  titulo: string;
  conteudo: string;
  autor: string;
};

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function carregarPost() {
        try {
          const resposta = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/posts/${id}`,
          );

          if (!resposta.ok) {
            throw new Error("Erro ao buscar post");
          }

          const dados = await resposta.json();
          setPost(dados);
        } catch (error) {
          setErro(error instanceof Error ? error.message : "Erro desconhecido");
        } finally {
          setCarregando(false);
        }
      }

      if (id) {
        carregarPost();
      }
    }, [id]),
  );

  async function excluirPost() {
    Alert.alert(
      "Excluir postagem",
      "Tem certeza que deseja excluir esta postagem?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const resposta = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/${id}`, {
                method: "DELETE",
              });

              if (!resposta.ok) {
                throw new Error("Erro ao excluir postagem");
              }

              Alert.alert("Sucesso", "Postagem excluída!");
              router.back();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a postagem.");
            }
          },
        },
      ],
    );
  }

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      {carregando ? (
        <Text>Carregando post...</Text>
      ) : erro ? (
        <Text style={{ color: "red" }}>{erro}</Text>
      ) : post ? (
        <>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {post.titulo}
          </Text>

          <Text style={{ marginTop: 10 }}>Por {post.autor}</Text>

          <Text style={{ marginTop: 20, fontSize: 16 }}>{post.conteudo}</Text>
        </>
      ) : (
        <Text>Carregando post...</Text>
      )}
      <Pressable
        onPress={() => router.push(`/posts/edit/${id}`)}
        style={{
          backgroundColor: "#2563eb",
          padding: 14,
          borderRadius: 10,
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Editar postagem
        </Text>
      </Pressable>
      <Pressable
        onPress={excluirPost}
        style={{
          backgroundColor: "#dc2626",
          padding: 14,
          borderRadius: 10,
          marginTop: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Excluir postagem
        </Text>
      </Pressable>
    </View>
  );
}
