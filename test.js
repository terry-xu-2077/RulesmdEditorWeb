let jsonData = {
  YURIPR: {
    Prerequisite: "BARRACKS---------",
    Owner: "YuriCountry,Americans--------",
    AllowedToStartInMultiplayer: "yyyyes-----------",
    Cost: "500-------",
    Soylent: "7500----------",
    Points: "500-------------",
  },
  ADOG: {
    UIName: "Name:newDOG-----------",
    Speed: "18-----------------",
    RejoinTeamIfLimboed: "noooo----------------",
  },
};

let text = `; If multiple rules files are present, the Name field is used to identify between them.

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
Speed=8
`;

/**
 * 使用jsonData中的值替换text中匹配的键和子键
 * @param {Object} jsonData - 包含要替换的键值对的对象
 * @param {string} text - 要替换的文本
 * @returns {string} 替换后的文本
 */
function replaceText(jsonData, text) {
  let newText = text;
  for (const key in jsonData) {
    for (const subKey in jsonData[key]) {
      // 构造正则表达式，用于查找匹配的键和子键
      const regex = new RegExp(
        `(\[(${key})\]\s*\n[\s\S]*?${subKey}=)([^;\n]*)([^\n]*)`
      );
      // 使用jsonData中的值替换掉原来的值
      console.log(`匹配：${key}:${subKey}`, regex.test(newText));
      newText = newText.replace(regex, `$1${jsonData[key][subKey]}$3`);
    }
  }
  return newText;
}

let newText = replaceText(jsonData, text);
console.log(newText);
