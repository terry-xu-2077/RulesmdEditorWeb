const regex =
  /(\[(YURIPR)\]\s*\n[\s\S]*?AllowedToStartInMultiplayer=)([^;\n]*)([^\n]*)/;

// Alternative syntax using RegExp constructor
// const regex = new RegExp('(\\[(YURIPR)\\]\\s*\\n[\\s\\S]*?PixelSelectionBracketDelta=)([^;\\n]*)([^\\n]*)', '')

const str = `; If multiple rules files are present, the Name field is used to identify between them.

[YURIPR]
Prerequisite=YABRCK,YATECH;Yuri Prime is now the high end yuri
PixelSelectionBracketDelta=-26;gs higher number draws lower.  Pixel difference from normal for selection bracket
Owner=YuriCountry
AllowedToStartInMultiplayer=no
Cost=1500
Soylent=750
OpenTransportWeapon=1;defaults to -1 (decide normally)  What weapon should I use in a Battle Fortress


; Attack dog
[ADOG]
UIName=Name:DOG
Name=Allied Attack Dog
NotHuman=yes
Category=Soldier
ReselectIfLimboed=yes ; If selected when limbo and attacking infantry, reseect when unlimbo
RejoinTeamIfLimboed=yes ; If in a team when limbo shooting infantry, write it down and try to rejoin when unlimbo
DefaultToGuardArea=yes ; the much awaited dog default to move and attack when resting
TechLevel=2
Cost=500
AllowedToStartInMultiplayer=no
Pip=white
Sight=9
DetectDisguise=yes
Speed=8`;
m = regex.exec(str);
console.log(m[1]);
