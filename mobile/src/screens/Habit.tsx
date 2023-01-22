import { useRoute } from "@react-navigation/native";
import { Alert, ScrollView, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import dayjs from "dayjs";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/Checkbox";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { HabitEmpty } from "../components/HabitEmpty";
import clsx from 'clsx';

interface Params {
    date: string;
}

interface DayInfo {
    completedHabits: string[];
    possibleHabits: {
        id: string;
        title: string;
    }[]
}

export function Habit() {

    const route = useRoute();
    const { date } = route.params as Params;

    const [loading, setLoading] = useState(true);
    const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
    const [completedHabits, setCompletedHabits] = useState<string[]>([]);

    const parsedDate = dayjs(date);
    const isDateInPast = parsedDate.endOf('day').isBefore(new Date());
    const dayOfWeek = parsedDate.format('dddd');
    const dayAndMonth = parsedDate.format('DD/MM');
    const habitsProgress = dayInfo?.possibleHabits.length ?
        generateProgressPercentage(dayInfo.possibleHabits.length, completedHabits.length)
        : 0

    async function fetchHabits() {
        try {
            setLoading(true);

            const res = await api.get('/day', { params: { date } })

            setDayInfo(res.data);
            setCompletedHabits(res.data.completedHabits);
        } catch (err) {
            console.log(err);
            Alert.alert('Ops', 'Não foi possível carregar as informações dos hábitos!');
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleHabit(habitId: string) {
        try {
            await api.patch(`habits/${habitId}/toggle`);
            
            if (completedHabits.includes(habitId))
                setCompletedHabits((state) => state.filter(id => id !== habitId));
            else
                setCompletedHabits((state) => [...state, habitId]);
        } catch (err) {
            Alert.alert('Ops', 'Não foi possível atualizar o status do hábito.');
            console.log(err);
        }
    }

    useEffect(() => {
        fetchHabits();
    }, [])

    if (loading)
        return <Loading />

    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <BackButton />
                <Text className="mt-6 text-zinc-400 font-semibold text-base capitalize">
                    {dayOfWeek}
                </Text>
                <Text className="text-white font-extrabold text-3xl">
                    {dayAndMonth}
                </Text>
                <ProgressBar progress={habitsProgress} />
                <View className={clsx("mt-6", {
                    ["opacity-50"]: isDateInPast
                })}>
                    {
                        dayInfo?.possibleHabits ?
                            dayInfo.possibleHabits.map(habit => {
                                return (
                                    <Checkbox key={habit.id} title={habit.title}
                                        checked={completedHabits.includes(habit.id)}
                                        disabled={isDateInPast}
                                        onPress={() => handleToggleHabit(habit.id)} />
                                )
                            })
                            : <HabitEmpty />
                    }
                </View>
                {
                    isDateInPast ?
                        <Text className="text-white mt-10 text-center">
                            Os hábitos acima não podem ser alterados após a data passada.
                        </Text>
                        : null
                }
            </ScrollView>
        </View>
    )
}