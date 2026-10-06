import { LineChart, Line, YAxis } from "recharts";

export default function Sparkline({ series }) {
    return (
        <LineChart width={72} height={20} data={series} margin={{ top: 1, right: 0, bottom: 1, left: 0 }} accessibilityLayer={false}>

            <YAxis hide domain={["dataMin", "dataMax"]} />

            <Line dataKey="price" stroke="var(--color-brass)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
    );
}