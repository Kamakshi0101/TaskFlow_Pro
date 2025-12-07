import { formatDistanceToNow } from 'date-fns'
import { FiCheckCircle, FiEdit, FiFileText, FiMessageCircle, FiUpload, FiUser } from 'react-icons/fi'

const ACTIVITY_ICONS = {
  created: FiFileText,
  completed: FiCheckCircle,
  updated: FiEdit,
  commented: FiMessageCircle,
  uploaded: FiUpload,
  default: FiUser
}

const ACTIVITY_COLORS = {
  created: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  updated: 'bg-yellow-100 text-yellow-600',
  commented: 'bg-purple-100 text-purple-600',
  uploaded: 'bg-pink-100 text-pink-600',
  default: 'bg-gray-100 text-gray-600'
}

const ActivityItem = ({ type = 'default', user, action, target, timestamp, avatar }) => {
  const Icon = ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default
  const colorClass = ACTIVITY_COLORS[type] || ACTIVITY_COLORS.default
  
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200">
      {/* Avatar or Icon */}
      <div className="flex-shrink-0">
        {avatar ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
            {avatar}
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shadow-sm`}>
            <Icon className="text-lg" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{user}</span>
          {' '}
          <span className="text-gray-600">{action}</span>
          {' '}
          {target && <span className="font-semibold text-indigo-600">{target}</span>}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>

      {/* Action Indicator */}
      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${type === 'completed' ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
    </div>
  )
}

export default ActivityItem
