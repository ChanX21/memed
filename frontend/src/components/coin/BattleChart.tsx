"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

const chartConfig = {
  wins: {
    label: "Wins",
    color: "hsl(var(--chart-1))",
  },
  losses: {
    label: "Losses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type BattleStatsArray = [
  bigint, // totalBattlesInitiated
  bigint, // totalBattlesParticipated
  bigint, // totalWins
  bigint, // totalVotes
  bigint, // lastBattleTime
  bigint, // lastWinTime
  boolean, // isKing
  bigint, // kingCrownedTime
];

type TokenData = [
  string, // name
  string, // ticker
  string, // description
  string, // image
  string, // owner (Ethereum address)
  number, // stage (uint8)
  bigint, // collateral (uint256)
  bigint, // createdAt (uint256)
];

export function BattleChart({
  data,
  tokenData,
}: {
  data: BattleStatsArray | undefined;
  tokenData: TokenData | undefined;
}) {
  const [chartData, setChartData] = useState<
    { month: string; wins: number; losses: number }[]
  >([]);
  const [totalBattles, setTotalBattles] = useState<number | null>(null);

  function formatMonthAndYear(timestamp: number | bigint): string {
    const date = new Date(Number(timestamp) * 1000); // Convert timestamp to milliseconds
    const currentDate = new Date();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[date.getMonth()]; // Month in words for the timestamp
    const year = date.getFullYear(); // Year for the timestamp
    const currentMonth = monthNames[currentDate.getMonth()]; // Current month in words
    const currentYear = currentDate.getFullYear(); // Current year

    // If the timestamp month and year match the current month and year, return just "Month Year"
    if (month === currentMonth && year === currentYear) {
      return `${month} ${year}`;
    }

    // Otherwise, return "Month Year - Current Month Year"
    return `${month} ${year} - ${currentMonth} ${currentYear}`;
  }

  useEffect(() => {
    if (data) {
      // Extract wins and losses from data
      const wins = Number(data[2]);
      const losses = Number(data[3]);
      const calculatedTotal = wins + losses;

      // Update state with computed values
      setChartData([{ month: "January", wins, losses }]);
      setTotalBattles(calculatedTotal);
    }
  }, [data]);

  return (
    <Card className="flex flex-col border-none shadow-none h-full    w-full bg-transparent">
      <CardHeader className="items-center pb-0">
        <CardTitle>Token battle performance</CardTitle>
        <CardDescription>
          {tokenData ? formatMonthAndYear(tokenData[7]) : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex  pt-20   items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalBattles?.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Battles
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="wins"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-wins)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="losses"
              fill="var(--color-losses)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total battles for the{" "}
          {tokenData
            ? formatDistanceToNow(
                new Date(parseInt(tokenData[7].toString()) * 1000),
                { addSuffix: true },
              )
            : ""}
        </div>
      </CardFooter>
    </Card>
  );
}
