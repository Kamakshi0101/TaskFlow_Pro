import { motion } from 'framer-motion'

const KpiCard = ({ icon: Icon, title, value, trend, trendValue, gradient = 'from-indigo-500 to-purple-500' }) => {
  const isPositive = trend === 'up'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="text-white text-2xl" />
        </div>
        
        {trendValue && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>

      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </motion.div>
  )
}

export default KpiCard
