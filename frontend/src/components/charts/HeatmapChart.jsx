import { useState } from 'react'
import { format, addDays, isSameDay, startOfYear, getDay } from 'date-fns'

const HeatmapChart = ({ data = [] }) => {
  const [hoveredCell, setHoveredCell] = useState(null)

  // Generate dates from January 1st to today
  const generateDates = () => {
    const dates = []
    const today = new Date()
    const jan1 = startOfYear(today)
    const daysDiff = Math.floor((today - jan1) / (1000 * 60 * 60 * 24)) + 1
    
    for (let i = 0; i < daysDiff; i++) {
      dates.push(addDays(jan1, i))
    }
    return dates
  }

  const dates = generateDates()

  // Get task count for a specific date
  const getTaskCount = (date) => {
    const dayData = data.find(d => isSameDay(new Date(d.date), date))
    return dayData ? dayData.count : 0
  }

  // Get color intensity based on count (dark theme like GitHub)
  const getColor = (count) => {
    if (count === 0) return 'bg-[#161b22]'
    if (count <= 2) return 'bg-[#0e4429]'
    if (count <= 5) return 'bg-[#006d32]'
    if (count <= 10) return 'bg-[#26a641]'
    return 'bg-[#39d353]'
  }

  // Group dates into weeks (7 rows for days of week)
  const groupByWeek = () => {
    const weeks = []
    const firstDate = dates[0]
    const firstDayOfWeek = getDay(firstDate) // 0 = Sunday, 1 = Monday, etc.
    
    // Add empty cells for days before the first date
    const emptyCells = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Adjust for Monday start
    const allCells = Array(emptyCells).fill(null).concat(dates)
    
    // Group into weeks (columns)
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7))
    }
    
    return weeks
  }

  // Get month groups - group consecutive weeks by month (majority of days in week)
  const getMonthGroups = () => {
    const weekGroups = groupByWeek()
    const monthGroups = []
    let currentMonth = null
    let monthWeeks = []
    
    weekGroups.forEach((week, idx) => {
      // Get the month that has the most days in this week
      const realDates = week.filter(d => d !== null)
      if (realDates.length > 0) {
        // Count days per month in this week
        const monthCounts = {}
        realDates.forEach(date => {
          const month = format(date, 'MMM')
          monthCounts[month] = (monthCounts[month] || 0) + 1
        })
        
        // Get the month with most days
        const month = Object.keys(monthCounts).reduce((a, b) => 
          monthCounts[a] > monthCounts[b] ? a : b
        )
        
        if (month !== currentMonth && currentMonth !== null) {
          // Start a new month group
          monthGroups.push({
            month: currentMonth,
            weeks: monthWeeks,
            startWeekIdx: monthWeeks[0].weekIdx
          })
          monthWeeks = []
        }
        currentMonth = month
        monthWeeks.push({ week, weekIdx: idx })
      }
    })
    
    // Push the last month
    if (monthWeeks.length > 0 && currentMonth) {
      monthGroups.push({
        month: currentMonth,
        weeks: monthWeeks,
        startWeekIdx: monthWeeks[0].weekIdx
      })
    }
    
    return monthGroups
  }

  const weekGroups = groupByWeek()
  const monthGroups = getMonthGroups()

  return (
    <div className="relative bg-[#0d1117] p-4 rounded-lg border border-gray-800">
      {/* Month Labels */}
      <div className="flex mb-3 ml-6 relative h-4">
        {monthGroups.map((group, idx) => (
          <div 
            key={idx} 
            className="text-[11px] text-gray-500 flex-1"
          >
            {group.month}
          </div>
        ))}
      </div>

      <div className="flex gap-[2px]">
        {/* Day Labels */}
        <div className="flex flex-col gap-[3px] text-[9px] text-gray-500 pr-1 justify-around">
          <div className="h-[11px] flex items-center">Mon</div>
          <div className="h-[11px]"></div>
          <div className="h-[11px] flex items-center">Wed</div>
          <div className="h-[11px]"></div>
          <div className="h-[11px] flex items-center">Fri</div>
          <div className="h-[11px]"></div>
          <div className="h-[11px]"></div>
        </div>

        {/* Heatmap Grid - Group by months */}
        <div className="flex gap-2 pb-2 flex-1">
          {monthGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex gap-[3px] flex-1">
              {group.weeks.map(({ week, weekIdx }) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((date, dayIdx) => {
                    if (!date) {
                      return <div key={dayIdx} className="w-[11px] h-[11px]"></div>
                    }
                    
                    const count = getTaskCount(date)
                    const dateStr = format(date, 'MMM d, yyyy')
                    
                    return (
                      <div
                        key={dayIdx}
                        className={`w-[11px] h-[11px] rounded-[2px] ${getColor(count)} border border-gray-800/50 transition-all duration-200 hover:ring-1 hover:ring-gray-400 cursor-pointer relative`}
                        onMouseEnter={() => setHoveredCell({ date: dateStr, count })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {hoveredCell && hoveredCell.date === dateStr && (
                          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                            <div className="font-semibold">{count} tasks</div>
                            <div className="text-gray-400 text-[11px]">{dateStr}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
        <span>Less</span>
        <div className="flex gap-[2px]">
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22] border border-gray-800/50"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429] border border-gray-800/50"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32] border border-gray-800/50"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641] border border-gray-800/50"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353] border border-gray-800/50"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default HeatmapChart
