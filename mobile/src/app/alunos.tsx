import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Aluno = {
  id: number;
  nome: string;
  email: string;
};

export default function AlunosScreen() {
  const router = useRouter();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [autenticado, setAutenticado] = useState(false);

  async function requisicao(caminho = "", method = "GET", body?: object) {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      throw new Error("Faça login.");
    }

    const resposta = await fetch(`${API_URL}/alunos${caminho}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (resposta.status === 401) {
      await AsyncStorage.removeItem("token");
      setAutenticado(false);
      router.replace("/login");
      throw new Error("Sessão expirada.");
    }

    if (!resposta.ok) {
      throw new Error("Erro na operação.");
    }

    if (resposta.status === 204) return null;

    return resposta.json();
  }

  async function carregarAlunos() {
    try {
      const dados = await requisicao(`?pagina=${pagina}`);
      setAlunos(dados);
      setAutenticado(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar alunos.");
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarAlunos();
    }, [pagina]),
  );

  function limpar() {
    setNome("");
    setEmail("");
    setEditando(null);
  }

  async function salvar() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Atenção", "Preencha nome e e-mail.");
      return;
    }

    try {
      if (editando !== null) {
        await requisicao(`/${editando}`, "PUT", {
          nome,
          email,
        });
      } else {
        await requisicao("", "POST", {
          nome,
          email,
        });
      }

      limpar();
      await carregarAlunos();
      Alert.alert("Sucesso", "Aluno salvo!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  }

  function editar(aluno: Aluno) {
    setEditando(aluno.id);
    setNome(aluno.nome);
    setEmail(aluno.email);
  }

  function excluir(id: number) {
    Alert.alert("Excluir aluno", "Deseja confirmar?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await requisicao(`/${id}`, "DELETE");

            if (editando === id) limpar();

            await carregarAlunos();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  }

  if (!autenticado) {
    return (
      <View style={styles.container}>
        <Text>Verificando acesso...</Text>

        <Pressable style={styles.botao} onPress={carregarAlunos}>
          <Text style={styles.textoBotao}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alunos}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>Gerenciar alunos</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Pressable style={styles.botao} onPress={salvar}>
              <Text style={styles.textoBotao}>
                {editando !== null ? "Salvar alterações" : "Cadastrar aluno"}
              </Text>
            </Pressable>

            {editando !== null && (
              <Pressable style={styles.botao} onPress={limpar}>
                <Text style={styles.textoBotao}>Cancelar edição</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.email}>{item.email}</Text>

            <View style={styles.acoes}>
              <Pressable style={styles.editar} onPress={() => editar(item)}>
                <Text style={styles.textoBotao}>Editar</Text>
              </Pressable>

              <Pressable
                style={styles.excluir}
                onPress={() => excluir(item.id)}
              >
                <Text style={styles.textoBotao}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum aluno nesta página.</Text>}
        ListFooterComponent={
          <View style={styles.paginacao}>
            <Pressable
              disabled={pagina === 1}
              onPress={() => setPagina(pagina - 1)}
            >
              <Text style={styles.link}>Anterior</Text>
            </Pressable>

            <Text>Página {pagina}</Text>

            <Pressable
              disabled={alunos.length < 10}
              onPress={() => setPagina(pagina + 1)}
            >
              <Text style={styles.link}>Próxima</Text>
            </Pressable>
          </View>
        }
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
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    color: "#1e293b",
  },
  botao: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#172554",
  },
  email: {
    color: "#64748b",
    marginBottom: 12,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
  },
  editar: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },
  excluir: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },
  paginacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  link: {
    color: "#2563eb",
    fontWeight: "bold",
  },
});
