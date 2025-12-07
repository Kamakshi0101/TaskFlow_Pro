import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = {
  pending: '#A78BFA',
  'in-progress': '#60A5FA',
  completed: '#34D399',
  todo: '#F472B6',
  low: '#34D399',
  medium: '#FBBF24',
  high: '#F87171'
}

const CustomPieChart = ({ data, dataKey = 'value', nameKey = 'name', centerLabel }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl px-4 py-3 rounded-xl shadow-lg border border-indigo-100">
          <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} tasks ({((payload[0].value / data.reduce((a, b) => a + b[dataKey], 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderCenterLabel = ({ cx, cy }) => {
    if (!centerLabel) return null
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
        <tspan x={cx} dy="-0.5em" className="text-2xl font-bold" fill="#1F2937">
          {centerLabel.value}
        </tspan>
        <tspan x={cx} dy="1.5em" className="text-sm" fill="#6B7280">
          {centerLabel.label}
        </tspan>
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={centerLabel ? 60 : 0}
          fill="#8884d8"
          dataKey={dataKey}
          label={renderCenterLabel}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry[nameKey]] || `hsl(${index * 45}, 70%, 65%)`}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CustomPieChart
