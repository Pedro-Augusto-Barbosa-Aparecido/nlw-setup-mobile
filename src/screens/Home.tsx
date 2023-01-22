import { Text, View, ScrollView, Alert } from "react-native"

import { generateRangeDatesFromYearStart } from "../utils/generate-range-between-dates";

import { useFocusEffect, useNavigation } from "@react-navigation/native"

import { Header } from "../components/Header"
import { DAY_SIZE, HabitDay } from "../components/HabitDay"

import { api } from "../lib/axios";
import { useCallback, useState } from "react";
import { Loading } from "../components/loading";
import dayjs from "dayjs";

const weekDays = ["D","S","T","Q","Q","S","S"]; 
const datesFromYearStart = generateRangeDatesFromYearStart();
const minimumSummaryDatesSizes = 18 * 5;
const amountOfDatesToFill = minimumSummaryDatesSizes - datesFromYearStart.length;

interface SummaryProps {
  id: string;
  date: string;
  amount: number;
  completed: number;
}

export function Home() {
  const [loading, setLoading] = useState<boolean>(true)
  const [summary, setSummary] = useState<SummaryProps[] | null>(null)

  const { navigate } = useNavigation()

  async function fetchData() {
    try {
      setLoading(true)
      const response = await api.get('summary');
      setSummary(response.data.summary)
    } catch (error) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }


  useFocusEffect(useCallback(() => {
    fetchData()
  }, []))

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />
      <View
        className="flex-row mt-6 mb-2"
      >
        {weekDays.map((weekDay, index) => {
          return (
            <Text 
              key={`${weekDay}-${index}`}
              className="text-zinc-400 text-xl font-bold text-center mx-1"
              style={{
                width: DAY_SIZE,
                height: DAY_SIZE
              }}
            >
              {weekDay}
            </Text>
          )
        })}
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100
        }}
      >
      {
        summary.length > 0 && (
          <View className="flex-row flex-wrap">
            {
              datesFromYearStart.map((date) => {
                const dayWithHabit = summary.find(day => {
                  return dayjs(date).isSame(day.date, "day")
                })

                return (
                  <HabitDay 
                    key={date.toISOString()} 
                    date={date.toISOString()}
                    amountCompleted={dayWithHabit?.amount}
                    amountOfHabits={dayWithHabit?.completed}
                    onPress={() => navigate("habit", {
                      date: date.toISOString()
                    })}
                  />
                )
              })
            }
            {
              amountOfDatesToFill > 0 && Array
              .from({ length: amountOfDatesToFill })
              .map((_, date) => {
                return (
                  <View
                  key={date.toString()}
                    className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                    style={{
                      width: DAY_SIZE,
                      height: DAY_SIZE,
                    }}
                  />
                )
              })
            }
          </View>

        ) 
      }
      </ScrollView>
    </View>
  )
}