import { CAT, courses } from "./report-data";

export type ChartId = "shareChart" | "quarterChart" | "typeChart" | "monthChart" | "catChart";

export interface ChartInstance {
  destroy(): void;
  stop(): void;
  update(mode?: string): void;
}

export interface ChartGlobal {
  new (canvas: HTMLCanvasElement, config: unknown): ChartInstance;
  defaults: { font: { family: string }; color: string };
}

export const getChartGlobal = () => (window as unknown as { Chart?: ChartGlobal }).Chart;

export const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function donut(
  Chart: ChartGlobal,
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[],
  colors: string[],
  unit: string,
  reduce: boolean,
) {
  return new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: cssVar("--surface"),
          borderWidth: 4,
          borderRadius: 8,
          spacing: 3,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      cutout: "70%",
      animation: { animateRotate: true, duration: reduce ? 0 : 1500, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c: { raw: number }) => ` ${c.raw} ${unit}` } },
      },
    },
  });
}

export function buildChart(id: ChartId, Chart: ChartGlobal, reduce: boolean): ChartInstance {
  const canvas = document.getElementById(id) as HTMLCanvasElement;

  switch (id) {
    case "shareChart":
      return donut(
        Chart,
        canvas,
        ["Closed by me", "Rest of the team"],
        [90, 175],
        [cssVar("--violet"), cssVar("--surface-2")],
        "tickets",
        reduce,
      );

    case "typeChart":
      return donut(
        Chart,
        canvas,
        ["Features", "Bugs", "Infrastructure tasks", "Security fixes"],
        [78, 21, 5, 4],
        [cssVar("--violet"), cssVar("--rose"), cssVar("--teal"), cssVar("--amber")],
        "tickets",
        reduce,
      );

    case "quarterChart":
      return new Chart(canvas, {
        type: "bar",
        data: {
          labels: ["Q1", "Q2", "Q3", "Q4 so far"],
          datasets: [
            {
              data: [11, 43, 35, 1],
              backgroundColor: [cssVar("--slate"), cssVar("--violet"), cssVar("--violet"), cssVar("--slate")],
              borderRadius: 10,
              maxBarThickness: 72,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          animation: { duration: reduce ? 0 : 1300, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: { raw: number }) => ` ${c.raw} tickets closed` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: cssVar("--ink"), font: { weight: 600 } } },
            y: { beginAtZero: true, grid: { color: cssVar("--line") }, ticks: { color: cssVar("--muted") } },
          },
        },
      });

    case "monthChart": {
      const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
      const keys = Object.keys(CAT) as (keyof typeof CAT)[];
      return new Chart(canvas, {
        type: "bar",
        data: {
          labels: months,
          datasets: keys.map((k) => ({
            label: CAT[k].label,
            backgroundColor: cssVar(CAT[k].c),
            borderRadius: 5,
            data: months.map((_, i) => courses.filter((c) => c[1] === k && new Date(c[4]).getMonth() === i + 1).length),
          })),
        },
        options: {
          maintainAspectRatio: false,
          animation: { duration: reduce ? 0 : 1200 },
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: cssVar("--ink"), usePointStyle: true, pointStyle: "rectRounded", padding: 14 },
            },
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: cssVar("--ink") } },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: { stepSize: 1, color: cssVar("--muted") },
              grid: { color: cssVar("--line") },
            },
          },
        },
      });
    }

    case "catChart": {
      const keys = Object.keys(CAT) as (keyof typeof CAT)[];
      return new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: keys.map((k) => CAT[k].label),
          datasets: [
            {
              data: keys.map((k) =>
                +(courses.filter((c) => c[1] === k).reduce((a, c) => a + c[3], 0) / 60).toFixed(1),
              ),
              backgroundColor: keys.map((k) => cssVar(CAT[k].c)),
              borderColor: cssVar("--surface"),
              borderWidth: 4,
              borderRadius: 6,
              spacing: 2,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          cutout: "64%",
          animation: { duration: reduce ? 0 : 1400 },
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: cssVar("--ink"), usePointStyle: true, pointStyle: "rectRounded", padding: 12 },
            },
            tooltip: { callbacks: { label: (c: { raw: number }) => ` ${c.raw} hours` } },
          },
        },
      });
    }
  }
}
