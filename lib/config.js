let text = `
; Medium Tank
[MTNK]
UIName=Name:MTNK
Name=Grizzly Battle Tank
Image=GTNK
IsSelectableCombatant=yes
Explosion=TWLT070,S_BANG48,S_BRNL58,S_CLSN58,S_TUMU60
CrushSound=TankCrush
MaxDebris=2
; origional - Locomotor={55D141B8-DB94-11d1-AC98-006008055BB5}
Locomotor={4A582741-9839-11d1-B709-00A024DDAFD1}
;MovementZone=Destroyer ;gs FLAW needs to be changed to this when The Flaw is fixed
MovementZone=Normal
ThreatPosed=15	; This value MUST be 0 for all building addons
BuildTimeMultiplier=1.5;Individual control of build time

; **************************************************************************

[YURIPR]
UIName=Name:YuriPrime
Name=Yuri Prime
Image=YURIX
Category=Soldier
Prerequisite=YABRCK,YATECH;Yuri Prime is now the high end yuri
Primary=SuperMindControl
Secondary=SuperPsiWave
OpenTransportWeapon=1;defaults to -1 (decide normally)  What weapon should I use in a Battle Fortress
CrushSound=InfantrySquish
Crushable=no
TiberiumProof=yes
Strength=150
Armor=flak
TechLevel=10
Pip=red
PixelSelectionBracketDelta=-26;gs higher number draws lower.  Pixel difference from normal for selection bracket
Sight=9
Speed=6
Owner=YuriCountry
AllowedToStartInMultiplayer=no
Cost=1500
Soylent=750
Points=50
IsSelectableCombatant=yes
VoiceSelect=YuriPrimeSelect
VoiceMove=YuriPrimeMove
VoiceAttack=YuriPrimeAttackCommand
VoiceFeedback=YuriPrimeFear
VoiceSpecialAttack=YuriPrimeMove
DieSound=YuriPrimeDie
MoveSound=YuriPrimeMoveLoop
CreateSound=YuriPrimeCreated
;Locomotor={4A582744-9839-11d1-B709-00A024DDAFD1};
;MovementZone=Infantry

;SpeedType=Hover
;Locomotor={4A582742-9839-11d1-B709-00A024DDAFD1}
;MovementZone=Amphibious ; gs AMphibiousDestroyer I can't have a destroyer zone without a weapon!
;gs Correct in theory, but Hover only works properly for units.


; ********************************* IFV ************************************

;Infantry Fighting Vehicle - IFV
[FV]
UIName=Name:FV
Name=IFV
Prerequisite=TECH,BARRACKS
Crusher=no
TooBigToFitUnderBridge=true
Turret=yes ;GEF should be no for ifv???
Passengers=1
Gunner=yes
AirRangeBonus=4 ;GEF this should always be less than or equal to the range of the primary weapon. Otherwise targeting issues could arise
;GEF If you change TurretCount, find this line in objtype.h and change it to reflect the new number of turrets
WeaponCount=17
Weapon1=HoverMissile		;Normal
EliteWeapon1=HoverMissileE		;Normal
Weapon2=RepairBullet	;Engineer
EliteWeapon2=RepairBullet	;Engineer
Weapon3=CRM60			;GI
EliteWeapon3=CRM60			;GI
EliteWeapon16=CRSuperMindBlast		;Yuri Prime
Weapon17=CRMissileLauncher		;Guardian GI
;1=gun
;2=repair arm
;3=high-tech`;

// const regex = /\[[^\]]+\]/g;
// const sections = text.match(regex);
// const splitText = text.split(regex);

// const result = { comments: [] };

// splitText.forEach((sectionText, index) => {
//   const sectionKey = sections?.[index];
//   if (sectionKey) {
//     const lines = sectionText.split("\n");
//     result[sectionKey] = lines.reduce(
//       (acc, line) => {
//         if (line.startsWith(";")) {
//           acc.comments.push(line);
//           result.comments.push(line);
//         } else {
//           const [key, value] = line.split("=");
//           if (key && value) {
//             acc[key] = value;
//           }
//         }
//         return acc;
//       },
//       { comments: [] }
//     );
//   }
// });
// console.log(result);

const jsonData = {
  MTNK: { MaxDebris: "10", ThreatPosed: "30" },
  FV: { Name: "newIFV", Turret: "no" },
};

function replaceText(jsonData, text, debug = false) {
  let newText = text;
  for (const key in jsonData) {
    for (const subKey in jsonData[key]) {
      const regex = new RegExp(
        `(\\[${key}\\]\\s*\n[\\s\\S]*?${subKey}=)([^;\n]*)([^\n]*)`
      );
      // --------------------- debug -------------------
      if (debug) {
        console.log("RegExp:", regex.source);
        if (!regex.test(newText)) {
          console.log("没有匹配到:", key, subKey, "RegExp:", regex.source);
        }
      }
      // -----------------------------------------------
      newText = newText.replace(regex, `$1${jsonData[key][subKey]}$3`);
    }
  }
  return newText;
}

const jsData = {
  YURIPR: {
    AllowedToStartInMultiplayer: "yes",
    Owner: "Americans,YuriCountry",
    Cost: "100",
    Strength: "300",
    Prerequisite: "BARRACKS",
  },
};

console.log(jsData);
console.log(replaceText(jsData, text, true));
