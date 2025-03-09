import { Box, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { memo } from "react";

const MonthlyChart = memo(
  ({ data, title, label = "Шығыс", height = { xs: 250, sm: 300 } }) => {
    const chartOptions = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: {
                size: window.innerWidth < 600 ? 10 : 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return `${label}: ${Math.abs(value).toLocaleString()} ₸`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString() + " ₸",
              font: {
                size: window.innerWidth < 600 ? 10 : 12,
              },
            },
          },
          x: {
            title: {
              display: true,
              text: "Күн",
              font: {
                size: window.innerWidth < 600 ? 10 : 12,
              },
            },
            ticks: {
              font: {
                size: window.innerWidth < 600 ? 10 : 12,
              },
            },
          },
        },
      }),
      [label]
    );

    return (
      <>
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {title}
        </Typography>
        <Box sx={{ height: height, mt: { xs: 1, sm: 2 } }}>
          <Line data={data} options={chartOptions} />
        </Box>
      </>
    );
  }
);

MonthlyChart.displayName = "MonthlyChart";

export default MonthlyChart;
