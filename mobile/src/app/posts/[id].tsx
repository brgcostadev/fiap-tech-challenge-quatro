import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  titulo: string;
  conteudo: string;
  autor: string;
};

export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
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
  }, [id]);

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
    </View>
  );
}
