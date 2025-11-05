import { useTown } from '@/state/townStore'
import { useEconomy } from '@/state/economyStore'
import { useCombat } from '@/state/combatStore'
import { getCostForLevel, generateBuildingDescription } from '@/data/buildings'
import { zones } from '@/data/zones'
import type { TownBuilding } from '@/state/townStore'
import type { Building } from '@/data/buildings'

type BuildingTileProps = {
  readonly townBuilding: TownBuilding
  readonly buildingData: Building
  readonly canUpgrade: boolean
  readonly onUpgrade: (buildingId: string) => void
}

function BuildingTile({ townBuilding, buildingData, canUpgrade, onUpgrade }: BuildingTileProps) {
  const { gold, materials } = useEconomy()
  const { buildings } = useTown()
  const isMaxLevel = townBuilding.level >= buildingData.maxLevel
  const cost = getCostForLevel(buildingData, townBuilding.level)
  
  // Calculate canUpgrade locally with live state
  const canActuallyUpgrade = (() => {
    if (isMaxLevel) return false
    
    // Check gold cost
    if (cost.gold && gold < cost.gold) return false
    
    // Check material costs
    if (cost.materials) {
      for (const [materialId, amount] of Object.entries(cost.materials)) {
        if ((materials[materialId] || 0) < amount) {
          return false
        }
      }
    }
    
    return true
  })()
  
  // Generate dynamic description with current effects
  const dynamicDescription = generateBuildingDescription(buildingData.id, townBuilding.level, buildings)

  const materialsText = cost.materials 
    ? Object.entries(cost.materials)
        .map(([mat, qty]) => `${qty} ${mat}`)
        .join(', ')
    : ''

  return (
    <div className="bg-black/20 border border-white/10 rounded-lg p-3 transition-all hover:bg-black/30">
      <div className="flex justify-between">
        <div>
          <b className="text-text">{buildingData.name}</b>
          <div className="text-muted text-[11px] whitespace-pre-line">
            {dynamicDescription}
          </div>
        </div>
        <span className="text-muted text-sm">Lv {townBuilding.level}/{buildingData.maxLevel}</span>
      </div>

      <div className="text-muted text-xs mt-1">
        Category: {buildingData.category}
      </div>

      {!isMaxLevel && (
        <button
          disabled={!canActuallyUpgrade}
          onClick={() => onUpgrade(townBuilding.id)}
          className="mt-1.5 w-full"
        >
          {townBuilding.level === 0 ? 'Unlock' : 'Upgrade'} — {cost.gold?.toLocaleString() || 0}g
          {materialsText && ` + ${materialsText}`}
        </button>
      )}

      {isMaxLevel && (
        <div className="text-muted mt-1.5 text-center text-sm">
          Max Level Reached
        </div>
      )}
    </div>
  )
}

export default function TownPanel() {
  const { buildings, canUpgrade, upgrade, getAvailableBuildings } = useTown()
  const availableBuildings = getAvailableBuildings()

  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
      <h3 className="m-0 mb-3 text-text">Town</h3>
      <div className="flex flex-col gap-2">
        {availableBuildings.map(buildingData => {
          const townBuilding = buildings.find(b => b.id === buildingData.id)
          if (!townBuilding) return null

          return (
            <BuildingTile
              key={buildingData.id}
              townBuilding={townBuilding}
              buildingData={buildingData}
              canUpgrade={canUpgrade(buildingData.id)}
              onUpgrade={upgrade}
            />
          )
        })}
      </div>
    </div>
  )
}
