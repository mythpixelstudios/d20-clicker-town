export interface Zone {
  id: number
  name: string
  description: string
  monstersToDefeat: number
  boss: string
  difficulty: number
  rewards: {
    goldMultiplier: number
    materials: string[]
  }
  unlockRequirement?: {
    type: 'zone_clear' | 'level' | 'prestige'
    value: number
  }
  isPrestige?: boolean
}

export const zones: Zone[] = [
  {
    id: 1,
    name: "Forest Outskirts",
    description: "A peaceful forest where weak creatures roam",
    monstersToDefeat: 10,
    boss: "Forest Guardian",
    difficulty: 1,
    rewards: {
      goldMultiplier: 1,
      materials: ["wood", "fiber", "leather"]
    }
  },
  {
    id: 2,
    name: "Dark Woods",
    description: "Deeper into the forest where shadows lurk",
    monstersToDefeat: 10,
    boss: "Shadow Wolf",
    difficulty: 1.5,
    rewards: {
      goldMultiplier: 1.2,
      materials: ["wood", "fiber", "leather", "bone"]
    }
  },
  {
    id: 3,
    name: "Mountain Base",
    description: "Rocky terrain with hardy creatures",
    monstersToDefeat: 10,
    boss: "Stone Golem",
    difficulty: 2,
    rewards: {
      goldMultiplier: 1.5,
      materials: ["stone", "iron", "fiber", "copper"]
    }
  },
  {
    id: 4,
    name: "Crystal Caves",
    description: "Glimmering caverns filled with magical beings",
    monstersToDefeat: 10,
    boss: "Crystal Spider",
    difficulty: 2.5,
    rewards: {
      goldMultiplier: 1.8,
      materials: ["crystal", "iron", "gemstone", "quartz"]
    },
    unlockRequirement: {
      type: 'level',
      value: 8
    }
  },
  {
    id: 5,
    name: "Volcanic Fields",
    description: "Scorching lands with fire creatures",
    monstersToDefeat: 10,
    boss: "Flame Titan",
    difficulty: 3,
    rewards: {
      goldMultiplier: 2,
      materials: ["obsidian", "fire_crystal", "sulfur", "ash"]
    },
    unlockRequirement: {
      type: 'level',
      value: 12
    }
  },
  {
    id: 6,
    name: "Frozen Tundra",
    description: "Icy wasteland with frozen beasts",
    monstersToDefeat: 10,
    boss: "Ice King",
    difficulty: 3.5,
    rewards: {
      goldMultiplier: 2.3,
      materials: ["ice_crystal", "frozen_wood", "permafrost", "silver"]
    },
    unlockRequirement: {
      type: 'level',
      value: 16
    }
  },
  {
    id: 7,
    name: "Desert Ruins",
    description: "Ancient ruins inhabited by sand creatures",
    monstersToDefeat: 10,
    boss: "Sand Wraith",
    difficulty: 4,
    rewards: {
      goldMultiplier: 2.7,
      materials: ["sand_glass", "ancient_stone", "gold_dust", "mithril_ore"]
    },
    unlockRequirement: {
      type: 'level',
      value: 20
    }
  },
  {
    id: 8,
    name: "Mystic Grove",
    description: "Magical forest with enchanted creatures",
    monstersToDefeat: 10,
    boss: "Arcane Treant",
    difficulty: 4.5,
    rewards: {
      goldMultiplier: 3,
      materials: ["magic_dust", "enchanted_bark", "moonstone", "adamantine_ore"]
    },
    unlockRequirement: {
      type: 'level',
      value: 24
    }
  },
  {
    id: 9,
    name: "Sky Islands",
    description: "Floating islands with aerial creatures",
    monstersToDefeat: 10,
    boss: "Wind Drake",
    difficulty: 5,
    rewards: {
      goldMultiplier: 3.5,
      materials: ["wind_crystal", "cloud_essence", "dragon_scale", "platinum"]
    },
    unlockRequirement: {
      type: 'level',
      value: 28
    }
  },
  {
    id: 10,
    name: "Demon Realm",
    description: "The ultimate challenge - realm of demons",
    monstersToDefeat: 10,
    boss: "Demon Lord",
    difficulty: 6,
    rewards: {
      goldMultiplier: 4,
      materials: ["soul_crystal", "demon_bone", "infernal_iron", "orichalcum"]
    },
    unlockRequirement: {
      type: 'level',
      value: 35
    }
  },
  {
    id: 11,
    name: "Void Nexus",
    description: "The final trial - complete this to unlock prestige",
    monstersToDefeat: 15,
    boss: "Void Emperor",
    difficulty: 10,
    rewards: {
      goldMultiplier: 10,
      materials: [] // All void materials are NPC-only
    },
    unlockRequirement: {
      type: 'level',
      value: 60 // INCREASED: was 50, now 60 - much harder to reach
    },
    isPrestige: true
  }
]

export function getZone(zoneId: number): Zone {
  return zones.find(zone => zone.id === zoneId) || zones[0]
}

export function getNextZone(currentZoneId: number): Zone {
  const nextZone = zones.find(zone => zone.id === currentZoneId + 1)
  return nextZone || zones[zones.length - 1]
}

export function getTotalZones(): number {
  return zones.length
}