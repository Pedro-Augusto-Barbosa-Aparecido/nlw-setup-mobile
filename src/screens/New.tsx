import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";
import { useState } from "react";

import { Feather } from "@expo/vector-icons"
import colors from "tailwindcss/colors";
import { api } from "../lib/axios";

const availableWeekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
]

export function New() {
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false)

  function handleToggleWeekDay(weekDayIndex: number) {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays(state => state.filter(weekDay => weekDay !== weekDayIndex));
    } else {
      setWeekDays(state => [...state, weekDayIndex]);
    }
  }

  async function handleCreateNewHabit() {
    try {
      setLoading(true)
      if (!title.trim() || weekDays.length === 0) {
        return Alert.alert("Novo hábito", "Informe o nome do hábito e escolha a periodicidade");
      }

      await api.post("habits", { title, weekDays });

      Alert.alert("Novo hábito", "Novo hábito criado com sucesso")

    } catch (error) {
      console.log(error)
      Alert.alert("Ops", "Não foi possível criar um novo hábito")
    } finally {
      setTitle("")
      setWeekDays([])
      setLoading(false)
    }

  }

  return (
    <View
      className="flex-1 bg-background px-8 pt-16"
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100
        }}
      >
        <BackButton />

        <Text className="mt-6 text-white font-extrabold text-3xl">
          Criar hábito
        </Text>
        
        <Text className="mt-6 text-white font-semibold text-base">
          Qual seu comprometimento?
        </Text>

        <TextInput 
          value={title}
          onChangeText={setTitle}
          placeholder="Exercícios, dormir bem, etc..."
          placeholderTextColor={colors.zinc[400]}
          className="h-12 pl-4 mt-3 rounded-lg bg-zinc-900 border-2 border-zinc-800 text-white focus:border-2 focus:border-green-600"
        />

        <Text className="mt-4 mb-3 text-white font-semibold text-base">
          Qual seu comprometimento?
        </Text>

        {
          availableWeekDays.map((weekDay, index) => {
            return (
              <Checkbox 
                key={weekDay}
                title={weekDay}
                checked={weekDays.includes(index)}
                onPress={() => handleToggleWeekDay(index)}
              />
            )
          })
        }

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCreateNewHabit}
          className="w-full h-14 flex-row items-center justify-center bg-green-500 rounded-sm mt-6"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Feather 
                name="check"
                size={20}
                color={colors.white}
              />

              <Text className="font-semibold text-white text-base ml-2">
                Confirmar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}