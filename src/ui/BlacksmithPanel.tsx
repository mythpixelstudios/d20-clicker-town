import { useState } from 'react'
import { useTown } from '@/state/townStore'
import { useEconomy } from '@/state/economyStore'
import { useCrafting } from '@/state/craftingStore'
import { equipmentTemplates, canCraftEquipment, rarityInfo } from '@/data/equipment'
import type { Equipment } from '@/data/equipment'
import type { CraftingJob } from '@/state/craftingStore'

type CraftingItemProps = {
  readonly equipment: Equipment
  readonly canCraft: boolean
  readonly onCraft: (equipment: Equipment) => void
  readonly craftingJob?: CraftingJob
  readonly successRate: number
  readonly craftingTime: number
  readonly willQueue: boolean
}

function CraftingItem({ equipment, canCraft, onCraft, craftingJob, successRate, craftingTime, willQueue }: CraftingItemProps) {
  const recipe = equipment.craftingRecipe
  if (!recipe) return null

  const materialsList = Object.entries(recipe.materials)
    .map(([mat, qty]) => `${qty} ${mat}`)
    .join(', ')

  const statsText = Object.entries(equipment.stats)
    .map(([stat, value]) => `+${value} ${stat}`)
    .join(', ')

  // Calculate progress if currently crafting
  const progress = craftingJob ? 
    Math.min(100, ((Date.now() - craftingJob.startTime) / craftingJob.duration) * 100) : 0

  const timeRemaining = craftingJob ? 
    Math.max(0, (craftingJob.startTime + craftingJob.duration - Date.now()) / 1000) : 0

  return (
    <div 
      className="crafting-item"
      style={{
        background: '#1b2130',
        border: `2px solid ${rarityInfo[equipment.rarity].color}`,
        borderRadius: '8px',
        padding: '12px',
        opacity: canCraft && !craftingJob ? 1 : 0.6
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ 
            color: rarityInfo[equipment.rarity].color, 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {equipment.name}
          </div>
          <div className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>
            {equipment.slot} | Level {equipment.level}
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {statsText}
          </div>
          <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
            Success Rate: {Math.round(successRate * 100)}% | Time: {craftingTime}s
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: '11px' }}>
            Cost: {recipe.gold}g{materialsList && ` + ${materialsList}`}
          </div>
          
          {craftingJob ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '11px', color: '#6fe19a' }}>
                Crafting... {Math.round(timeRemaining)}s
              </div>
              <div style={{
                width: '80px',
                height: '4px',
                background: '#1a1f2a',
                borderRadius: '2px',
                marginTop: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#6fe19a',
                  transition: 'width 0.1s ease'
                }} />
              </div>
            </div>
          ) : (
            <button 
              disabled={!canCraft} 
              onClick={() => onCraft(equipment)}
              style={{ 
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '12px'
              }}
            >
              {willQueue ? 'Add to Queue' : 'Craft'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const BlacksmithPanel = () => {
  const { getBuilding } = useTown()
  const { gold, materials } = useEconomy()
  const { 
    activeJobs, 
    queuedJobs, 
    maxActiveJobs,
    startCrafting, 
    addToQueue,
    removeFromQueue,
    calculateSuccessRate, 
    calculateCraftingTime,
    clearQueue
  } = useCrafting()
  const [selectedCategory, setSelectedCategory] = useState<'weapon' | 'armor'>('weapon')
  
  const blacksmithBuilding = getBuilding('blacksmith')
  const blacksmithLevel = blacksmithBuilding?.level || 0
  
  if (blacksmithLevel === 0) {
    return (
      <div className="card">
        <h3>Blacksmith</h3>
        <div className="muted">
          Build the Blacksmith to unlock equipment crafting!
        </div>
      </div>
    )
  }

  const availableEquipment = equipmentTemplates.filter(eq => {
    if (!eq.craftingRecipe) return false
    if (eq.craftingRecipe.requiredBlacksmithLevel > blacksmithLevel) return false
    
    if (selectedCategory === 'weapon') {
      return eq.slot === 'weapon'
    } else {
      return eq.slot !== 'weapon'
    }
  })

  const handleCraft = (equipment: Equipment) => {
    // Try to start crafting immediately if there's space
    if (activeJobs.length < maxActiveJobs) {
      startCrafting(equipment.id)
    } else {
      // Add to queue if no immediate space
      addToQueue(equipment.id)
    }
  }

  const handleRemoveFromQueue = (jobId: string) => {
    removeFromQueue(jobId)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Blacksmith</h3>
        <div className="muted">Level {blacksmithLevel}</div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button 
          onClick={() => setSelectedCategory('weapon')}
          style={{ 
            background: selectedCategory === 'weapon' ? '#334155' : 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 12px',
            fontSize: '12px'
          }}
        >
          Weapons
        </button>
        <button 
          onClick={() => setSelectedCategory('armor')}
          style={{ 
            background: selectedCategory === 'armor' ? '#334155' : 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 12px',
            fontSize: '12px'
          }}
        >
          Armor
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
        {availableEquipment.map(equipment => {
          const canCraft = canCraftEquipment(equipment, materials, gold, blacksmithLevel)
          const craftingJob = activeJobs.find(job => job.equipmentId === equipment.id)
          const successRate = calculateSuccessRate(equipment)
          const craftingTime = calculateCraftingTime(equipment)
          const willQueue = activeJobs.length >= maxActiveJobs
          
          return (
            <CraftingItem
              key={equipment.id}
              equipment={equipment}
              canCraft={canCraft && !craftingJob}
              onCraft={handleCraft}
              craftingJob={craftingJob}
              successRate={successRate}
              craftingTime={craftingTime}
              willQueue={willQueue}
            />
          )
        })}
        
        {availableEquipment.length === 0 && (
          <div className="muted">
            No {selectedCategory === 'weapon' ? 'weapons' : 'armor pieces'} available at this level.
            Upgrade your blacksmith to unlock more recipes!
          </div>
        )}
      </div>
      
      {/* Crafting Queue */}
      {queuedJobs.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4>Crafting Queue ({queuedJobs.length})</h4>
            <button 
              onClick={clearQueue}
              style={{ 
                padding: '4px 8px', 
                fontSize: '11px',
                backgroundColor: '#dc3545',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            >
              Clear Queue
            </button>
          </div>
          <div style={{ display: 'grid', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {queuedJobs.map((queuedJob, index) => {
              const equipment = equipmentTemplates.find(eq => eq.id === queuedJob.equipmentId)
              if (!equipment) return null
              
              return (
                <div 
                  key={queuedJob.id}
                  style={{
                    background: '#1a1f2a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ color: rarityInfo[equipment.rarity].color, fontWeight: 'bold' }}>
                      {equipment.name}
                    </span>
                    <span className="muted" style={{ marginLeft: '8px' }}>
                      #{index + 1} in queue
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromQueue(queuedJob.id)}
                    style={{ 
                      padding: '2px 6px', 
                      fontSize: '10px',
                      backgroundColor: '#6c757d',
                      border: 'none',
                      borderRadius: '3px',
                      color: 'white'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Active Jobs Status */}
      {activeJobs.length > 0 && (
        <div style={{ marginTop: '12px', padding: '8px', background: '#1a1f2a', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#6fe19a', marginBottom: '4px' }}>
            Active Jobs: {activeJobs.length}/{maxActiveJobs}
          </div>
          {queuedJobs.length > 0 && (
            <div style={{ fontSize: '11px', color: '#ffc107' }}>
              Next in queue will start automatically when a slot opens
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BlacksmithPanel