import { useState } from 'react'
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns'

const HeatmapChart = ({ data = [], weeks = 12 }) => {
  const [hoveredCell, setHoveredCell] = useState(null)

  // Generate last N weeks of dates
  const generateDates = () => {
    const dates = []
    const today = new Date()
    const startDate = subDays(today, weeks * 7)
    
    for (let i = 0; i < weeks * 7; i++) {
      dates.push(addDays(startDate, i))
    }
    return dates
  }

  const dates = generateDates()
  const weekStart = startOfWeek(dates[0])

  // Get task count for a specific date
  const getTaskCount = (date) => {
    const dayData = data.find(d => isSameDay(new Date(d.date), date))
    return dayData ? dayData.count : 0
  }

  // Get color intensity based on count
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100'
    if (count <= 2) return 'bg-indigo-200'
    if (count <= 5) return 'bg-indigo-400'
    if (count <= 10) return 'bg-indigo-600'
    return 'bg-indigo-800'
  }

  // Group dates by week
  const groupByWeek = () => {
    const weeks = []
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7))
    }
    return weeks
  }

  const weekGroups = groupByWeek()
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="relative">
      {/* Day Labels */}
      <div className="flex mb-2">
        <div className="w-10"></div>
        <div className="flex-1 grid grid-cols-7 gap-1 text-xs text-gray-500">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="text-center">{day}</div>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-1">
        {weekGroups.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 items-center">
            {/* Week Label */}
            <div className="w-10 text-xs text-gray-500">
              {weekIdx % 2 === 0 && format(week[0], 'MMM d')}
            </div>
            
            {/* Days */}
            <div className="flex-1 grid grid-cols-7 gap-1">
              {week.map((date, dayIdx) => {
                const count = getTaskCount(date)
                const dateStr = format(date, 'MMM d, yyyy')
                
                return (
                  <div
                    key={dayIdx}
                    className={`aspect-square rounded-md ${getColor(count)} transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer relative`}
                    onMouseEnter={() => setHoveredCell({ date: dateStr, count })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hoveredCell && hoveredCell.date === dateStr && (
                      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                        <div className="font-semibold">{count} tasks</div>
                        <div className="text-gray-300">{dateStr}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-gray-100"></div>
          <div className="w-3 h-3 rounded bg-indigo-200"></div>
          <div className="w-3 h-3 rounded bg-indigo-400"></div>
          <div className="w-3 h-3 rounded bg-indigo-600"></div>
          <div className="w-3 h-3 rounded bg-indigo-800"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default HeatmapChart
