import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { map } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Charts({ data }) {
  const chartRef = useRef();

  const setSeriesData = useCallback(() => {
    let seriesData = [];
    data.forEach((item) => {
      seriesData.push({
        y: item.scoreTotal,
        ...item,
      });
    });
    setChartOptions({
      series: {
        data: seriesData,
      },
    });
  }, [data]);

  useEffect(() => {
    setSeriesData();
  }, [setSeriesData]);

  const [chartOptions, setChartOptions] = useState({
    title: {
      text: "Total Goals timeline",
    },
    accessibility: {
      description: "Total Goals timeline",
    },
    xAxis: {
      categories: map(data, "date"),
    },
    series: [
      {
        name: "Total Goals",
        data: null,
        type: "area",
        lineWidth: 1,
        animate: true,
        zones: [
          {
            value: 5, // Points with y-value up to 10 will be red
            color: "blue",
          },
          {
            value: 8, // Points with y-value between 10 and 20 will be blue
            color: "orange",
          },
          {
            // Points with y-value above 20 will be green (no 'value' means it's the last zone)
            color: "red",
          },
        ],
      },
    ],
    tooltip: {
      pointFormatter: function () {
        return `<span style="color:${this.color}">●</span>${this.series.name}: <b>${this.y}</b><br/>
        ${this.participant1_nickname}: <b>${this.participant1_score}</b><br/>
        ${this.participant2_nickname}: <b>${this.participant2_score}</b>`;
      },
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderColor: "black",
      borderRadius: 5,
      borderWidth: 1,
      shadow: true,
    },
  });

  return (
    <div id="container" className="highcharts-dark">
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
}
