import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#F87171',
  default: '#6366F1'
}

const CustomBarChart = ({ data, dataKey = 'value', xKey = 'name', showGradient = true }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl px-4 py-3 rounded-xl shadow-lg border border-indigo-100">
          <p className="text-sm font-semibold text-gray-800">{payload[0].payload[xKey]}</p>
          <p className="text-sm text-indigo-600 font-semibold">{payload[0].value} tasks</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis 
          dataKey={xKey} 
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
        <Bar 
          dataKey={dataKey} 
          radius={[10, 10, 0, 0]}
          maxBarSize={60}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={showGradient ? "url(#colorBar)" : (COLORS[entry[xKey].toLowerCase()] || COLORS.default)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CustomBarChart
