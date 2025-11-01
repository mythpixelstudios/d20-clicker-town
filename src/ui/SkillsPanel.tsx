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
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: 14, 
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: 2
        }}>
          {skillInfo.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          Rank {skillValue}
        </div>
      </div>
      
      <button 
        disabled={!canUpgrade} 
        onClick={() => onUpgrade(skillKey)}
        style={{
          width: 32,
          height: 32,
          fontSize: 18,
          fontWeight: 'bold',
          borderRadius: 6
        }}
      >
        +
      </button>
      
      {showTooltip && (
        <div className="tooltip" style={{ width: 280, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{skillInfo.name}</div>
          <div style={{ fontSize: 12 }}>{skillInfo.description}</div>
        </div>
      )}
    </div>
  )
}

export default function SkillsPanel() {
  const { skillPoints, skills, addSkillPoint } = useChar()
  const canUpgrade = skillPoints > 0

  return (
    <div className="card" style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        padding: '12px',
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 8
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Combat Skills</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Specialize your character's abilities
          </div>
        </div>
        <div style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: skillPoints > 0 ? 'var(--gold)' : 'var(--muted)'
        }}>
          {skillPoints} <span style={{ fontSize: 14 }}>points</span>
        </div>
      </div>

      {categories.map(category => {
        const categorySkills = (Object.keys(skillDescriptions) as SkillKey[])
          .filter(key => skillDescriptions[key].category === category)
        
        return (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ 
              fontSize: 13,
              fontWeight: 'bold',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 8,
              padding: '4px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              {category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        <div style={{
          textAlign: 'center',
          padding: 16,
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 8,
          marginTop: 16,
          color: 'var(--muted)',
          fontSize: 13
        }}>
          💡 Gain skill points by leveling up (1 point every 2 levels)
        </div>
      )}
    </div>
  )
}
