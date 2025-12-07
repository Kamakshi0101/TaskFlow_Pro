import { motion } from 'framer-motion'

const GradientCard = ({ title, subtitle, children, gradient = 'from-indigo-500 via-purple-500 to-pink-500', className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 shadow-lg text-white relative overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-24 translate-y-24"></div>
      </div>

      <div className="relative z-10">
        {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
        {subtitle && <p className="text-white/80 text-sm mb-6">{subtitle}</p>}
        {children}
      </div>
    </motion.div>
  )
}

export default GradientCard
