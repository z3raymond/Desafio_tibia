const fs = require('fs');

class LogParser {
  constructor(logFile) {
    this.logFile = logFile;
    this.hitpointsHealed = 0;
    this.damageTaken = {
      total: 0,
      byCreatureKind: {}
    };
    this.experienceGained = 0;
    this.loot = {
      gold: 0,
      items: {}
    };
    this.totalHealthBlackKnight = 0;
    this.totalDamageUnknownOrigins = 0;
  }

  parseLog() {
    const logData = fs.readFileSync(this.logFile, 'utf-8');
    const lines = logData.split('\n');
    for (let i = 0; i < lines.length; i++) {
      this.parseLine(lines[i]);
    }

    return this.outputData();
  }

  parseLine(line) {
    const damageTakenRegex = /You lose (\d+) hitpoints due to an attack by (\w+)\./;
    const unknownDamageTakenRegex = /You lose (\d+) hitpoints\./;
    const hitpointsHealedRegex = /You healed yourself for (\d+) hitpoints/
    const experienceGainedRegex = /You gained (\d+) experience points\./;
    const lootRegex = /(\w+) drops (\d+) (.+)\./;

    if (damageTakenRegex.test(line)) {
      const [, damage, creatureKind] = line.match(damageTakenRegex);
      this.damageTaken.total += parseInt(damage, 10);
      if (creatureKind !== 'unknown') {
        if (this.damageTaken.byCreatureKind[creatureKind]) {
          this.damageTaken.byCreatureKind[creatureKind] += parseInt(damage, 10);
        } else {
          this.damageTaken.byCreatureKind[creatureKind] = parseInt(damage, 10);
        }
      } else {
        this.totalDamageUnknownOrigins += parseInt(damage, 10);
      }
    } else if (unknownDamageTakenRegex.test(line)) {
      const [, damage] = line.match(unknownDamageTakenRegex);
      this.damageTaken.total += parseInt(damage, 10);
      this.totalDamageUnknownOrigins += parseInt(damage, 10);
    } else if (hitpointsHealedRegex.test(line)) {
      const [, hitpoints] = line.match(hitpointsHealedRegex);
      this.hitpointsHealed += parseInt(hitpoints, 10);
    } else if (experienceGainedRegex.test(line)) {
      const [, experience] = line.match(experienceGainedRegex);
      this.experienceGained += parseInt(experience, 10);
    } else if (lootRegex.test(line)) {
      const [, creature, amount, item] = line.match(lootRegex);
      this.loot.gold += parseInt(amount, 10);
      if (this.loot.items[creature]) {
        this.loot.items[creature][item] = (this.loot.items[creature][item] || 0) + parseInt(amount, 10);
      } else {
        this.loot.items[creature] = { [item]: parseInt(amount, 10) };
      }
    }
  }

  outputData() {
    return {
      hitpointsHealed: this.hitpointsHealed,
      damageTaken: {
        total: this.damageTaken.total,
        byCreatureKind: this.damageTaken.byCreatureKind
      },
      experienceGained: this.experienceGained,
      loot: this.loot,
      totalHealthBlackKnight: this.totalHealthBlackKnight,
      totalDamageUnknownOrigins: this.totalDamageUnknownOrigins
    };
  }
}


// Usage
const parser=new LogParser('tibia_server.log')
const output =parser.parseLog()
console.log(output)