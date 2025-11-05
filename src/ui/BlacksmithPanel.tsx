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
      className={`bg-[#1b2130] border-2 rounded-lg p-3 transition-opacity ${canCraft && !craftingJob ? 'opacity-100' : 'opacity-60'}`}
      style={{
        borderColor: rarityInfo[equipment.rarity].color
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div
            className="font-bold text-sm"
            style={{ color: rarityInfo[equipment.rarity].color }}
          >
            {equipment.name}
          </div>
          <div className="text-muted text-[11px] mt-0.5">
            {equipment.slot} | Level {equipment.level}
          </div>
          <div className="text-xs mt-1">
            {statsText}
          </div>
          <div className="text-muted text-[11px] mt-1">
            Success Rate: {Math.round(successRate * 100)}% | Time: {craftingTime}s
          </div>
        </div>

        <div className="text-right">
          <div className="text-muted text-[11px]">
            Cost: {recipe.gold}g{materialsList && ` + ${materialsList}`}
          </div>

          {craftingJob ? (
            <div className="mt-2">
              <div className="text-[11px] text-green-400">
                Crafting... {Math.round(timeRemaining)}s
              </div>
              <div className="w-20 h-1 bg-[#1a1f2a] rounded-sm mt-1 overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              disabled={!canCraft}
              onClick={() => onCraft(equipment)}
              className="mt-2 px-2 py-1 text-xs"
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
      <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
        <h3 className="m-0 mb-2 text-text">Blacksmith</h3>
        <div className="text-muted">
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
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="m-0 text-text">Blacksmith</h3>
        <div className="text-muted">Level {blacksmithLevel}</div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSelectedCategory('weapon')}
          className={`px-3 py-1.5 text-xs border border-white/20 rounded transition-colors ${
            selectedCategory === 'weapon' ? 'bg-slate-700' : 'bg-transparent hover:bg-white/5'
          }`}
        >
          Weapons
        </button>
        <button
          onClick={() => setSelectedCategory('armor')}
          className={`px-3 py-1.5 text-xs border border-white/20 rounded transition-colors ${
            selectedCategory === 'armor' ? 'bg-slate-700' : 'bg-transparent hover:bg-white/5'
          }`}
        >
          Armor
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
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
          <div className="text-muted text-center py-4">
            No {selectedCategory === 'weapon' ? 'weapons' : 'armor pieces'} available at this level.
            Upgrade your blacksmith to unlock more recipes!
          </div>
        )}
      </div>

      {/* Crafting Queue */}
      {queuedJobs.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="m-0 text-text">Crafting Queue ({queuedJobs.length})</h4>
            <button
              onClick={clearQueue}
              className="px-2 py-1 text-[11px] bg-red-600 hover:bg-red-700 border-none rounded text-white transition-colors"
            >
              Clear Queue
            </button>
          </div>
          <div className="grid gap-1 max-h-[200px] overflow-y-auto">
            {queuedJobs.map((queuedJob, index) => {
              const equipment = equipmentTemplates.find(eq => eq.id === queuedJob.equipmentId)
              if (!equipment) return null

              return (
                <div
                  key={queuedJob.id}
                  className="bg-[#1a1f2a] border border-[#333] rounded px-2 py-2 text-xs flex justify-between items-center"
                >
                  <div>
                    <span
                      className="font-bold"
                      style={{ color: rarityInfo[equipment.rarity].color }}
                    >
                      {equipment.name}
                    </span>
                    <span className="text-muted ml-2">
                      #{index + 1} in queue
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromQueue(queuedJob.id)}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-600 hover:bg-gray-700 border-none rounded text-white transition-colors"
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
        <div className="mt-3 p-2 bg-[#1a1f2a] rounded">
          <div className="text-xs text-green-400 mb-1">
            Active Jobs: {activeJobs.length}/{maxActiveJobs}
          </div>
          {queuedJobs.length > 0 && (
            <div className="text-[11px] text-yellow-400">
              Next in queue will start automatically when a slot opens
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BlacksmithPanel