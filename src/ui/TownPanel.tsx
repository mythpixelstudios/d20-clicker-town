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
    <div className="building-tile">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <b>{buildingData.name}</b>
          <div className="muted" style={{ fontSize: '11px', whiteSpace: 'pre-line' }}>
            {dynamicDescription}
          </div>
        </div>
        <span className="muted">Lv {townBuilding.level}/{buildingData.maxLevel}</span>
      </div>
      
      <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
        Category: {buildingData.category}
      </div>
      
      {!isMaxLevel && (
        <button 
          disabled={!canActuallyUpgrade} 
          onClick={() => onUpgrade(townBuilding.id)}
          style={{ marginTop: '6px' }}
        >
          {townBuilding.level === 0 ? 'Unlock' : 'Upgrade'} — {cost.gold?.toLocaleString() || 0}g
          {materialsText && ` + ${materialsText}`}
        </button>
      )}
      
      {isMaxLevel && (
        <div className="muted" style={{ marginTop: '6px' }}>
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
    <div className="card">
      <h3>Town</h3>
      <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
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
