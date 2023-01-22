import { useEffect } from "react";
import { generateDatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning";
import { HabitDay } from "./HabitDay";
import { api } from '../lib/axios';
import { useState } from "react";
import dayjs from "dayjs";

const weekDays = [
    { abreviacao: 'D', dia: 'Domingo' },
    { abreviacao: 'S', dia: 'Segunda' },
    { abreviacao: 'T', dia: 'Terça' },
    { abreviacao: 'Q', dia: 'Quarta' },
    { abreviacao: 'Q', dia: 'Quinta' },
    { abreviacao: 'S', dia: 'Sexta' },
    { abreviacao: 'S', dia: 'Sábado' }
];

const summaryDates = generateDatesFromYearBeginning();
const minimumSummaryDatesSize = 18 * 7;
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

type Summary = {
    id: string;
    date: string;
    amount: number;
    completed: number;
}[]

export function SummaryTable() {

    const [summary, setSummary] = useState<Summary>([]);

    useEffect(() => {
        api.get('summary').then(response => {
            setSummary(response.data);
        })
    }, [])

    return (
        <main className="w-full flex">
            <div className="grid grid-rows-7 grid-flow-row gap-3">
                {
                    weekDays.map(weekDay => (
                        <div key={weekDay.dia} className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center">
                            {weekDay.abreviacao}
                        </div>
                    ))
                }
            </div>
            <div className="grid grid-rows-7 grid-flow-col gap-3">
                {
                    summary.length ? summaryDates.map(date => {
                        const dayInSummary = summary.find(day => {
                            return dayjs(date).isSame(day.date, 'day')
                        })

                        return (
                            <HabitDay key={date.toString()} date={date}
                                amount={dayInSummary?.amount} defaultCompleted={dayInSummary?.completed} />
                        )
                    }) : null
                }
                {
                    amountOfDaysToFill > 0 ?
                        Array.from({ length: amountOfDaysToFill }).map((_, i) => (
                            <div key={i}
                                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed" />
                        )) : null
                }
            </div>
        </main>
    )
}