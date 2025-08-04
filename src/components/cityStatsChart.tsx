"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";

interface CityStat {
  city: string;
  avgPrice: number;
  productCount: number;
}

interface CityStatsChartProps {
  data: CityStat[];
}

const CityStatsChart = ({ data }: CityStatsChartProps) => {
  //Proses data ke chart dengan hooks useRef dan useEffect
  const chartRef = useRef<HTMLDivElement>(null);

  // 1. Cache warna gradient
  const gradientColor = useMemo(() => {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: "#D6C0B3" },
      { offset: 0.5, color: "#AB886D" },
      { offset: 1, color: "#493628" },
    ]);
  }, []);

  // 2. Cache data series
  const chartData = useMemo(() => {
    return data.map((item) => ({
      value: item.avgPrice,
      itemStyle: {
        color: gradientColor,
      },
    }));
  }, [data, gradientColor]);

  // 3. Cache tooltip formatter
  const tooltipFormatter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: any) => {
      const { name, value } = params;
      const cityData = data.find((d) => d.city === name);
      return `
      <div class="p-2">
        <strong>${name}</strong><br/>
        Average: Rp ${value.toLocaleString()}<br/>
        Products: ${cityData?.productCount || 0}
      </div>
    `;
    },
    [data]
  );

  // 4. Cache opsi chart
  const chartOptions = useMemo<echarts.EChartsOption>(() => {
    return {
      tooltip: {
        trigger: "item",
        formatter: tooltipFormatter,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.city),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 12,
        },
      },
      yAxis: {
        type: "value",
        name: "Average Price",
        axisLabel: {
          formatter: (value: number) =>
            `Rp ${Math.round(value).toLocaleString()}`,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      series: [
        {
          name: "Average Price",
          type: "bar",
          data: chartData,
          label: {
            show: true,
            position: "top",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params:any) =>
              `Rp ${Math.round(params.value).toLocaleString()}`,
          },
          emphasis: {
            focus: "series",
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "#E4E0E1",
            },
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          backgroundColor: "#E4E0E1",
          fillerColor: "#E4E0E1",
        },
        {
          type: "slider",
          start: 0,
          end: 100,
          bottom: "5%",
        },
      ],
    };
  }, [data, chartData, tooltipFormatter]);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption(chartOptions);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [chartOptions, data.length]);

  return <article ref={chartRef} className="w-full h-[500px]" />;
};

export default CityStatsChart;
