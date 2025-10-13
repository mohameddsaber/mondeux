import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { _id: string; totalRevenue: number }[];
}

export const SalesByDateChart = ({ data }: Props) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="_id" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="totalRevenue" stroke="#2563eb" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);
