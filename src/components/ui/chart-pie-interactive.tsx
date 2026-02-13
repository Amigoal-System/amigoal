
"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type ChartData = {
  [key: string]: string | number
}

interface ChartPieInteractiveProps {
    data: ChartData[];
    chartConfig: ChartConfig;
    title: string;
    description: string;
    dataKey: string;
    nameKey: string;
    className?: string;
}


export function ChartPieInteractive({ 
    data, 
    chartConfig,
    title,
    description,
    dataKey,
    nameKey,
    className
}: ChartPieInteractiveProps) {
  const [activeItemKey, setActiveItemKey] = React.useState<string | null>(null);

  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr[dataKey]) || 0), 0);
  }, [data, dataKey]);

  const activeItem = React.useMemo(() => {
    if (!activeItemKey) {
      return { [nameKey]: "Total", [dataKey]: totalValue, label: "Total" };
    }
    const item = data.find((item) => item[nameKey] === activeItemKey);
    return item ? { ...item, label: chartConfig[activeItemKey as keyof typeof chartConfig]?.label } : { [nameKey]: "Total", [dataKey]: totalValue, label: "Total" };
  }, [activeItemKey, data, dataKey, nameKey, totalValue, chartConfig]);

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item[nameKey] === activeItemKey),
    [activeItemKey, data, nameKey]
  )

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color as string}
                  className="[&_.recharts-sector:focus-visible]:outline-none"
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activeItem[dataKey].toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {activeItem.label}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm pt-4">
            <div 
                className="flex w-full flex-wrap gap-2 items-center justify-center"
                onMouseLeave={() => setActiveItemKey(null)}
            >
            {data.map((item) => {
                const config = chartConfig[item[nameKey] as keyof typeof chartConfig];
                return (
                    <div 
                        key={item[nameKey]} 
                        className="flex items-center gap-1.5 text-xs cursor-pointer"
                        onMouseEnter={() => setActiveItemKey(item[nameKey] as string)}
                    >
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                        {config?.label || item[nameKey]}
                    </div>
                )
            })}
            </div>
      </CardFooter>
    </Card>
  )
}
