import { useChar, type CombatSkills } from '@/state/charStore'
import { useState } from 'react'

type SkillKey = keyof CombatSkills

const skillDescriptions: Record<SkillKey, { name: string; description: string; category: string }> = {
  // Weapon Skills
  swordsmanship: {
    name: 'Swordsmanship',
    description: '+0.5 attack bonus, +0.25 damage per rank with slashing weapons',
    category: 'Weapon Skills'
  },
  axemastery: {
    name: 'Axe Mastery',
    description: '+0.5 attack bonus, +0.3 damage per rank with axes',
    category: 'Weapon Skills'
  },
  archery: {
    name: 'Archery',
    description: '+0.5 attack bonus, +0.25 damage per rank with ranged weapons',
    category: 'Weapon Skills'
  },
  unarmed: {
    name: 'Unarmed Combat',
    description: '+0.5 attack bonus, +0.3 damage per rank when fighting without a weapon',
    category: 'Weapon Skills'
  },
  
  // Combat Skills
  heavyArmor: {
    name: 'Heavy Armor',
    description: '+1 AC per rank when wearing heavy armor',
    category: 'Combat Skills'
  },
  lightArmor: {
    name: 'Light Armor',
    description: '+0.5 AC per rank when wearing light armor',
    category: 'Combat Skills'
  },
  dodge: {
    name: 'Dodge',
    description: '+0.5 AC per rank, helps avoid attacks',
    category: 'Combat Skills'
  },
  toughness: {
    name: 'Toughness',
    description: 'Increases maximum HP (not yet implemented)',
    category: 'Combat Skills'
  },
  
  // Offensive Skills
  criticalStrike: {
    name: 'Critical Strike',
    description: '+0.5% critical hit chance per rank',
    category: 'Offensive Skills'
  },
  powerAttack: {
    name: 'Power Attack',
    description: '+0.3 damage per rank to all attacks',
    category: 'Offensive Skills'
  },
  quickDraw: {
    name: 'Quick Draw',
    description: '+0.1 attack speed per rank',
    category: 'Offensive Skills'
  },
  
  // Knowledge Skills
  monsterLore: {
    name: 'Monster Lore',
    description: '+0.2 damage per rank against all monsters',
    category: 'Knowledge Skills'
  },
  beastMastery: {
    name: 'Beast Mastery',
    description: 'Bonus damage against beast-type enemies (not yet implemented)',
    category: 'Knowledge Skills'
  },
  alchemy: {
    name: 'Alchemy',
    description: 'Improves potion effectiveness (not yet implemented)',
    category: 'Knowledge Skills'
  },
  
  // Utility Skills
  athletics: {
    name: 'Athletics',
    description: 'Improves overall physical performance (not yet implemented)',
    category: 'Utility Skills'
  },
  perception: {
    name: 'Perception',
    description: '+2% gold bonus per rank, better loot drops',
    category: 'Utility Skills'
  }
}

const categories = [
  'Weapon Skills',
  'Combat Skills',
  'Offensive Skills',
  'Knowledge Skills',
  'Utility Skills'
]

type SkillButtonProps = {
  skillKey: SkillKey
  skillValue: number
  canUpgrade: boolean
  onUpgrade: (skillKey: SkillKey) => void
}

function SkillButton({ skillKey, skillValue, canUpgrade, onUpgrade }: SkillButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const skillInfo = skillDescriptions[skillKey]

  return (
    <div
      className="relative flex items-center justify-between px-3 py-2 bg-black/20 rounded-lg border border-white/10 transition-all hover:bg-black/30"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex-1">
        <div className="text-sm font-bold text-text mb-0.5">
          {skillInfo.name}
        </div>
        <div className="text-[11px] text-muted">
          Rank {skillValue}
        </div>
      </div>

      <button
        disabled={!canUpgrade}
        onClick={() => onUpgrade(skillKey)}
        className="w-8 h-8 text-lg font-bold rounded-md"
      >
        +
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-70 bg-panel border border-white/20 rounded-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-50 pointer-events-none animate-tooltip-fade-in">
          <div className="font-bold mb-1">{skillInfo.name}</div>
          <div className="text-xs text-muted">{skillInfo.description}</div>
        </div>
      )}
    </div>
  )
}

export default function SkillsPanel() {
  const { skillPoints, skills, addSkillPoint } = useChar()
  const canUpgrade = skillPoints > 0

  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card h-full overflow-auto">
      <div className="flex justify-between items-center mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
        <div>
          <div className="text-lg font-bold">Combat Skills</div>
          <div className="text-xs text-muted mt-0.5">
            Specialize your character's abilities
          </div>
        </div>
        <div className={`text-2xl font-bold ${skillPoints > 0 ? 'text-gold' : 'text-muted'}`}>
          {skillPoints} <span className="text-sm">points</span>
        </div>
      </div>

      {categories.map(category => {
        const categorySkills = (Object.keys(skillDescriptions) as SkillKey[])
          .filter(key => skillDescriptions[key].category === category)

        return (
          <div key={category} className="mb-6">
            <div className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2 py-1 border-b border-white/10">
              {category}
            </div>
            <div className="flex flex-col gap-2">
              {categorySkills.map(skillKey => (
                <SkillButton
                  key={skillKey}
                  skillKey={skillKey}
                  skillValue={skills.combat[skillKey]}
                  canUpgrade={canUpgrade}
                  onUpgrade={addSkillPoint}
                />
              ))}
            </div>
          </div>
        )
      })}

      {skillPoints === 0 && (
        <div className="text-center p-4 bg-black/20 rounded-lg mt-4 text-muted text-[13px]">
          💡 Gain skill points by leveling up (1 point every 2 levels)
        </div>
      )}
    </div>
  )
}
