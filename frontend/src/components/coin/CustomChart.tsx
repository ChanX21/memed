// CustomChart.jsx
import { useEffect, useRef, memo } from "react";
import { createChart, ColorType } from "lightweight-charts";

function CustomChart() {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Chart options
    const chartOptions = {
      layout: {
        textColor: "black",
        background: { type: ColorType.Solid, color: "white" }, // Use the ColorType enum
      },
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, chartOptions);

    // Add area series
    const areaSeries = chart.addAreaSeries({
      lineColor: "#2962FF",
      topColor: "#2962FF",
      bottomColor: "rgba(41, 98, 255, 0.28)",
    });

    // Set data for the chart
    areaSeries.setData([
      { time: "2018-12-22", value: 32.51 },
      { time: "2018-12-23", value: 31.11 },
      { time: "2018-12-24", value: 27.02 },
      { time: "2018-12-25", value: 27.32 },
      { time: "2018-12-26", value: 25.17 },
      { time: "2018-12-27", value: 28.89 },
      { time: "2018-12-28", value: 25.46 },
      { time: "2018-12-29", value: 23.92 },
      { time: "2018-12-30", value: 22.68 },
      { time: "2018-12-31", value: 22.67 },
    ]);

    areaSeries.update({ time: "2018-12-31", value: 25 });

    // Fit content to the available space
    chart.timeScale().fitContent();

    // Cleanup function
    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      className="h-full w-full max-h-full relative"
    />
  );
}

export default memo(CustomChart);
