import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/accessibility";
import "highcharts/themes/adaptive";
import { map, round } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Charts({ data }) {
  const chartRef = useRef();

  const [chartOptions, setChartOptions] = useState({
    title: {
      text: "Total Goals timeline",
    },
    chart: {
      type: "areaspline",
    },
    plotOptions: {
      areaspline: {
        // stacking: "normal",
        lineColor: "#666666",
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: "#666666",
        },
      },
    },
    accessibility: {
      description: "Total Goals timeline",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: null,
    },
    series: null,
    tooltip: {
      pointFormatter: function () {
        return `<span style="color:${this.color}">●</span>${this.series.name}: <b>${this.y}</b><br/>
        ${this.player1}: <b>${this.player1_score}</b><br/>
        ${this.player2}: <b>${this.player2_score}</b>`;
      },
      // backgroundColor: "rgba(255, 255, 255, 0.8)",
      // borderColor: "black",
      borderRadius: 5,
      borderWidth: 1,
      shadow: true,
    },
  });

  const getSerieConfig = (title = null, data = null, isHalf = false) => {
    return {
      name: title,
      data: data,
      animate: true,
      zones: isHalf
        ? [
            {
              value: 4, // Points with y-value up to X will be red
              color: "rgba(0, 255, 60, 0.5)",
            },
            {
              // Points with y-value above X will be green (no 'value' means it's the last zone)
              color: "rgba(255, 145, 0, 5)",
            },
          ]
        : [
            {
              value: 5, // Points with y-value up to X will be red
              color: "rgba(25, 57, 172, 0.5)",
            },
            {
              value: 8, // Points with y-value between X and Y will be blue
              color: "rgba(255, 242, 0, 0.5)",
            },
            {
              // Points with y-value above Y will be green (no 'value' means it's the last zone)
              color: "rgba(255, 0, 0, 0.5)",
            },
          ],
    };
  };

  const setSeriesData = useCallback(() => {
    const chart = chartRef.current?.chart;

    // Total average
    const totalScores = map(data, "totalScore");
    const totalSum = totalScores.reduce((a, b) => a + b, 0);
    const totalAverage = totalSum / data.length;

    // Half average
    const halfScores = map(data, "halfScore");
    const halfSum = halfScores.reduce((a, b) => a + b, 0);
    const halfAverage = halfSum / data.length;

    console.log("totalAverage", totalAverage);
    console.log("halfAverage", halfAverage);

    const totalPlotLine = {
      id: "totalPlotLine",
      color: "#fff", // Color of the average line
      value: totalAverage, // The calculated average value
      width: 1, // Thickness of the line
      label: {
        text: "Total Goals Average: " + round(totalAverage, 2), // Optional label for the line
        style: {
          fontWeight: "600", // Smaller font size reduces width
        },
      },
      zIndex: 5,
    };

    const halfPlotLine = {
      id: "halfPlotLine",
      color: "#fff", // Color of the average line
      value: halfAverage, // The calculated average value
      width: 1, // Thickness of the line
      label: {
        text: "HalfTime Goals Average: " + round(halfAverage, 2), // Optional label for the line
        align: "right", // Horizontal alignment
        verticalAlign: "bottom", // Vertical alignment
        style: {
          fontWeight: "600", // Smaller font size reduces width
        },
      },
      zIndex: 5,
    };

    setChartOptions({
      xAxis: {
        categories: map(data, "date"),
      },
      yAxis: {
        plotLines: [totalPlotLine, halfPlotLine],
      },
      series: [
        {
          ...getSerieConfig(
            "Total Score",
            data.map((item) => {
              return {
                y: item.totalScore,
                ...item,
              };
            })
          ),
          events: {
            show: function () {
              chart.yAxis[0].addPlotLine(totalPlotLine);
            },
            hide: function () {
              chart.yAxis[0].removePlotLine("totalPlotLine");
            },
          },
        },
        {
          ...getSerieConfig(
            "Half Score",
            data.map((item) => {
              return {
                y: item.halfScore,
                ...item,
              };
            }),
            true
          ),
          events: {
            show: function () {
              chart.yAxis[0].addPlotLine(halfPlotLine);
            },
            hide: function () {
              chart.yAxis[0].removePlotLine("halfPlotLine");
            },
          },
        },
      ],
    });
  }, [data]);

  useEffect(() => {
    setSeriesData();
  }, [setSeriesData]);

  return (
    <figure className="highcharts-figure">
      <div id="container" className="highcharts-dark">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
      </div>
    </figure>
  );
}
