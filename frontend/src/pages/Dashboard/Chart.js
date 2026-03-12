import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
	BarChart,
	CartesianGrid,
	Bar,
	XAxis,
	YAxis,
	Label,
	ResponsiveContainer,
} from "recharts";
import { startOfHour, parseISO, format, differenceInDays, addDays, startOfDay } from "date-fns";

import { i18n } from "../../translate/i18n";

import Title from "./Title";
import useTickets from "../../hooks/useTickets";

const Chart = ({ dateStart, dateEnd }) => {
	const theme = useTheme();
	const { tickets } = useTickets({ dateStart, dateEnd });

	const [chartData, setChartData] = useState([]);

	useEffect(() => {
		if (tickets.length >= 0) {
			const diff = differenceInDays(parseISO(dateEnd), parseISO(dateStart));

			if (diff > 1) {
				// Agrupar por dia
				const days = [];
				for (let i = 0; i <= diff; i++) {
					const d = addDays(parseISO(dateStart), i);
					days.push({
						time: format(d, "dd/MM"),
						amount: 0,
						fullDate: format(d, "yyyy-MM-dd")
					});
				}

				tickets.forEach(ticket => {
					const ticketDate = format(parseISO(ticket.createdAt), "yyyy-MM-dd");
					const dayEntry = days.find(d => d.fullDate === ticketDate);
					if (dayEntry) dayEntry.amount++;
				});
				setChartData(days);
			} else {
				// Agrupar por hora (Padrão 08:00 - 19:00 ou conforme os tickets)
				const hours = [
					{ time: "08:00", amount: 0 },
					{ time: "09:00", amount: 0 },
					{ time: "10:00", amount: 0 },
					{ time: "11:00", amount: 0 },
					{ time: "12:00", amount: 0 },
					{ time: "13:00", amount: 0 },
					{ time: "14:00", amount: 0 },
					{ time: "15:00", amount: 0 },
					{ time: "16:00", amount: 0 },
					{ time: "17:00", amount: 0 },
					{ time: "18:00", amount: 0 },
					{ time: "19:00", amount: 0 },
				];

				tickets.forEach(ticket => {
					const ticketHour = format(startOfHour(parseISO(ticket.createdAt)), "HH:mm");
					const hourEntry = hours.find(h => h.time === ticketHour);
					if (hourEntry) hourEntry.amount++;
				});
				setChartData(hours);
			}
		}
	}, [tickets, dateStart, dateEnd]);

	return (
		<React.Fragment>
			<Title>{`${i18n.t("dashboard.charts.perDay.title")}${
				tickets.length
			}`}</Title>
			<ResponsiveContainer>
					<BarChart
						data={chartData}
						barSize={20}
						width={730}
						height={250}
						margin={{
							top: 16,
							right: 16,
							bottom: 0,
							left: 10,
						}}
					>
						<XAxis 
							dataKey="time" 
							stroke={theme.palette.text.secondary} 
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							type="number"
							allowDecimals={false}
							stroke={theme.palette.text.secondary}
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<Bar 
							dataKey="amount" 
							fill="#3b82f6" 
							radius={[10, 10, 0, 0]}
						/>
					</BarChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default Chart;
