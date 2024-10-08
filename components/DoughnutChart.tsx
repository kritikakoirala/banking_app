"use client";
import React from "react";
import { Chart, ArcElement, Tooltip } from "chart.js";

import { Doughnut } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip);

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const data = {
    datasets: [
      {
        label: "Banks",
        data: [100, 200, 400],
        backgroundColor: ["#0747b6", "#2265d8", "#2f91fa"],
      },
    ],
    labels: ["Bank 1", "Bank 2", "Bank 3"],
  };
  return (
    <Doughnut
      data={data}
      options={{
        cutout: "60%",
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
};

export default DoughnutChart;
