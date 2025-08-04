import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/accessibility";
import "highcharts/themes/adaptive";
import { map } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Charts({ data }) {
  const chartRef = useRef();

  const [chartOptions, setChartOptions] = useState({
    title: {
      text: "Total Goals timeline",
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
      type: "areaspline",
      lineWidth: 1,
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
    setChartOptions({
      xAxis: {
        categories: map(data, "date"),
      },
      series: [
        getSerieConfig(
          "Total Score",
          data.map((item) => {
            return {
              y: item.totalScore,
              ...item,
            };
          })
        ),
        getSerieConfig(
          "Half Score",
          data.map((item) => {
            return {
              y: item.halfScore,
              ...item,
            };
          }),
          true
        ),
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
