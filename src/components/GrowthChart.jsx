import "./GrowthChart.css";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts";
import { formatRupees, formatCompactRupees } from "../lib/formatNumbers";
import { formatDisplayDate, formatMonthYear } from "../lib/formatDisplayDate";

const yearOf = date => date.slice(0, 4);

function ChartTooltip({ active, payload }) {
    // Nothing being pointed at: return null, which means "draw nothing", and stop here.
    if (!active || payload.length === 0) return null;

    // Every entry in payload carries the whole row it came from, so the first one is enough:
    // row is { date, mix, benchmark }, straight from our adapter list.
    const row = payload[0].payload;

    return (
        <div className="chart-tooltip">
            <p>{formatDisplayDate(row.date)}</p>
            <p className="chart-tooltip-row"><span>Your mix</span><span className="num">{formatRupees(row.mix)}</span></p>
            <p className="chart-tooltip-row"><span>Benchmark</span><span className="num">{formatRupees(row.benchmark)}</span></p>
        </div>
    );
}

export default function GrowthChart({ mixSeries, benchmarkSeries, worstFallDate }) {

    const rows = mixSeries.map((point, i) => ({
        date: point.date,
        mix: point.total,
        benchmark: benchmarkSeries[i].total
    }));

    const newYearDates = rows
        .filter((row, i) => i > 0 && yearOf(row.date) !== yearOf(rows[i - 1].date))
        .map(row => row.date);

    const step = Math.ceil(newYearDates.length / 4);
    const yearTicks = newYearDates.filter((date, i) => i % step === 0);

    return (
        <div className="chart-wrap">
            <p className="chart-legend">
                <span><i className="legend-mark mark-mix"></i>Your mix</span>
                <span><i className="legend-mark mark-bm"></i>Nifty 500 index fund</span>
            </p>

            <LineChart data={rows} responsive style={{ width: "100%", aspectRatio: 720 / 248, minHeight: 180 }}>

                <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />

                <YAxis
                    tickCount={4}
                    tickFormatter={formatCompactRupees}
                    axisLine={false}
                    tickLine={false}
                    width="auto"
                    tick={{ className: "chart-label" }}
                />

                <XAxis
                    dataKey="date"
                    ticks={yearTicks}
                    tickFormatter={yearOf}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-border-strong)" }}
                    tick={{ className: "chart-label" }}
                />

                <ReferenceLine
                    x={worstFallDate}
                    stroke="var(--color-negative)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.45}
                    label={{ value: formatMonthYear(worstFallDate), position: "insideTopLeft", className: "chart-marker-label" }}
                />

                <Tooltip content={<ChartTooltip />} />

                {/* Round corners and ends, as in the original design. SVG's default is sharp points. */}
                <Line dataKey="benchmark" stroke="var(--color-benchmark)" strokeWidth={1.8} strokeDasharray="5 4" dot={false} isAnimationActive={false} strokeLinejoin="round" strokeLinecap="round" />
                <Line dataKey="mix" stroke="var(--color-brass)" strokeWidth={2.2} dot={false} isAnimationActive={false} strokeLinejoin="round" strokeLinecap="round" />
            </LineChart>
        </div>
    );
}