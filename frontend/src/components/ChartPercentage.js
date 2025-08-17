import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/accessibility";
import "highcharts/themes/adaptive";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ChartPercentage({ data, player1, player2 }) {
  const chartRef = useRef();

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "column",
    },
    title: {
      text: "Results",
    },
    xAxis: {
      categories: ["Result"],
    },
    yAxis: {
      min: 0,
      max: 105,
      title: {
        text: "Percent",
      },
      stackLabels: {
        enabled: true,
        useHTML: true,
      },
    },
    accessibility: {
      point: {
        valueDescriptionFormat:
          "{index}. {point.category}, {point.y:," +
          ".1f} billions, {point.percentage:.1f}%.",
      },
    },
    tooltip: {
      pointFormat:
        '<span style="color:{series.color}">{series.name}</span>' +
        ": <b>{point.y}</b> ({point.percentage:.0f}%)<br/>",
      // shared: true,
    },
    plotOptions: {
      column: {
        stacking: "percent",
        dataLabels: {
          enabled: true,
          format: "{point.percentage:.0f}%",
        },
      },
    },
    series: [],
  });

  const getSeries = (playerSelected) => {
    let player,
      opponent,
      wins = 0,
      loses = 0,
      draws = 0;
    data.forEach((match) => {
      if (match.player1 === playerSelected) {
        player = "player1_score";
        opponent = "player2_score";
      }
      if (match.player2 === playerSelected) {
        player = "player2_score";
        opponent = "player1_score";
      }
      if (!player) {
        return;
      }
      if (match[player] > match[opponent]) {
        wins++;
      } else if (match[player] < match[opponent]) {
        loses++;
      } else {
        draws++;
      }
    });
    return {
      wins,
      draws,
      loses,
    };
  };

  const setSeriesData = useCallback(() => {
    let winSerie = [],
      loseSerie = [],
      drawSerie = [],
      categories = [];

    if (player1) {
      const { wins, draws, loses } = getSeries(player1.value);
      winSerie.push(wins);
      drawSerie.push(draws);
      loseSerie.push(loses);
      categories.push(player1.value);
    }

    if (player2) {
      const { wins, draws, loses } = getSeries(player2.value);
      winSerie.push(wins);
      drawSerie.push(draws);
      loseSerie.push(loses);
      categories.push(player2.value);
    }

    setChartOptions({
      series: [
        {
          name: "Wins",
          data: winSerie,
          color: "green",
        },
        {
          name: "Draws",
          data: drawSerie,
          color: "yellow",
        },
        {
          name: "Loses",
          data: loseSerie,
          color: "red",
        },
      ],
      xAxis: {
        categories: categories,
      },
    });
  }, [data, player1, player2]);

  useEffect(() => {
    setSeriesData();
  }, [setSeriesData]);

  const hasData =
    chartOptions &&
    chartOptions.series &&
    chartOptions.series.some((s) => s.data && s.data.length > 0);

  return (
    <figure
      className="highcharts-figure"
      style={{ display: hasData ? "block" : "none" }}
    >
      <div id="chart-percentage">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
      </div>
    </figure>
  );
}
