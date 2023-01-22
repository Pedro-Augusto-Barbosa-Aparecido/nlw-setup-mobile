import { Alert, ScrollView, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native"
import { BackButton } from "../components/BackButton";

import dayjs from "dayjs";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/Checkbox";
import { useEffect, useState } from "react";
import { Loading } from "../components/loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { HabitEmpty } from "../components/HabitEmpty";
import clsx from "clsx";

interface Params {
  date: string;
}

interface DayInfoProps {
  completedHabits: string[]
  possibleHabits: Array<{
    id: string
    title: string
  }>
}

export function Habit() {
  const [loading, setLoading] = useState(true)
  const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null)
  const [completedHabits, setCompletedHabits] = useState<string[]>([]) 

  const route = useRoute();
  const { date } = route.params as Params;

  const parsedDate = dayjs(date);
  const isDateInPast = parsedDate.endOf("day").isBefore(new Date())
  const dayOfWeek = parsedDate.format("dddd");
  const dayAndMonth = parsedDate.format("DD/MM");

  const habitsProgress = dayInfo?.possibleHabits.length ? 
                          generateProgressPercentage(
                            dayInfo.possibleHabits.length, 
                            completedHabits.length
                          ) : 
                          0

  async function fetchHabits() {
    try {
      setLoading(true)

      const response = await api.get("day", {
        params: {
          date
        }
      })

      setDayInfo(response.data)
      setCompletedHabits(response.data.completedHabits)

    } catch(err) {
      console.log(err)
      Alert.alert("Ops", "Não foi possível carregar as informações dos hábitos")
    } finally {
      setLoading(false)
    }

  }

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habits/${habitId}/toggle`)
      if (completedHabits.includes(habitId)) {
        setCompletedHabits(state => state.filter(id => id !== habitId))
      } else {
        setCompletedHabits(state => [...state, habitId])
      }
    } catch(error) {
      console.log(error);
      Alert.alert("Ops", "Não foi possível atualizar o status do hábito")
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  if (loading) {
    return <Loading />
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

        <Text className="mt-6 text-zinc-400 font-semibold text-base capitalize">
          {dayOfWeek}
        </Text>
        
        <Text className="text-white mt-1 font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View
          className={
            clsx("mt-6", {
              "opacity-50": isDateInPast
            })
          }
        >
          {dayInfo?.possibleHabits.length ? dayInfo.possibleHabits.map((habit) => {
            return (
              <Checkbox 
                key={habit.id}
                disabled={isDateInPast}
                title={habit.title}
                checked={completedHabits.includes(habit.id)}
                onPress={() => handleToggleHabit(habit.id)}
              />
            )
          }) : (
            <HabitEmpty />
          )}          
        </View>
        {
          isDateInPast && (
            <Text className="text-white mt-10 text-center">
              Você não pode editar um hábito de uma data passada
            </Text>
          )
        }
      </ScrollView>
    </View>
  )
}