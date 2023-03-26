import * as iniParser from "./ini.js";

//异步请求GET
function GetINIfromXHR(url, callback, cache = true) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", encodeURI(url));
  if (!cache) {
    xhr.setRequestHeader("Cache-Control", "no-cache");
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(iniParser.parse(xhr.responseText));
    }
  };
  xhr.send();
}

function Parser(blob) {
  return iniParser.parse(blob);
}

function ToString(obj) {
  return iniParser.stringify(obj);
}

//ini对象转字符串
function hightLightString(obj) {
  let newText = "";
  for (let key in obj) {
    newText += `<span class="hight-light-words">${key}</span>\n${obj[key]}\n\n`;
  }
  return newText;
}

function ApplyRawString(rawStr, dataObj) {
  let newRaw = rawStr;
  for (let key in dataObj) {
    if (typeof dataObj[key] == "object") {
      newRaw = ApplyRawString(newRaw, dataObj[key]);
    } else {
      newRaw = newRaw.replace(
        new RegExp(`(${key}=).*?(?=\\s*($|;))`, "gm"),
        `$1${dataObj[key]}`
      );
    }
  }
  return newRaw;
}

const RULES_DESC = {
  INI_OBJ: {
    names: undefined,
    options: undefined,
    helps: undefined,
  },
  GEN_INI: {
    rulesINI: undefined,
    Buildings: undefined,
    filterTech(uiname) {
      try {
        if (parseFloat(this.rulesINI[uiname]["TechLevel"]) > -1) return true;
        return false;
      } catch (err) {
        return false;
      }
    },
    filterWeapon(section) {},
    generate() {
      //生成科技等级>-1的建筑列表
      this.Buildings = JSON.parse(
        JSON.stringify(RULES_DESC.INI_OBJ.options["Buildings_List"])
      );
      for (let id in this.rulesINI["BuildingTypes"]) {
        let uiname = this.rulesINI["BuildingTypes"][id];
        if (this.filterTech(uiname)) {
          this.Buildings[uiname] = RULES_DESC.getName(uiname);
        }
      }
    },
  },
  isMultiOptions(option) {
    for (let key in this.INI_OBJ.options["MultipleMenu"]) {
      let value = this.INI_OBJ.options["MultipleMenu"][key];
      if (value.includes(option)) {
        return key.split("_")[0];
      }
    }
    return "";
  },
  getSingleOptionList(option) {
    if (RULES_DESC.isMultiOptions(option) != "") return undefined;
    return RULES_DESC.INI_OBJ.options[`${option}_List`];
  },
  getMultiOptionList(option) {
    let key = RULES_DESC.isMultiOptions(option);
    if (key != "") {
      if (key == "Buildings") {
        return RULES_DESC.GEN_INI.Buildings;
      }
      return RULES_DESC.INI_OBJ.options[`${key}_List`];
    }
    return undefined;
  },
  getName(UIName) {
    let desc = this.INI_OBJ.names["NameDesc"][UIName];
    return desc == undefined ? UIName : desc;
  },
  getOption(option) {
    let desc = this.INI_OBJ.options["OptionDesc"][option];
    return desc == undefined ? option : desc;
  },
  getSingleValueDesc(option, value) {
    let desc = this.getName(value);
    if (desc == value) {
      let option_list = this.INI_OBJ.options[`${option}_List`];
      if (option_list != undefined) {
        let s_desc = option_list[value];
        if (s_desc != undefined) {
          desc = s_desc;
        }
      }
    }
    return desc;
  },
  getMultiValueDesc(option, value) {
    let value_list = [];
    if (value.includes(",")) {
      value_list = value.split(",");
    } else {
      value_list = [value];
    }

    let value_desc = [];
    for (let i in value_list) {
      value_desc.push(this.getSingleValueDesc(option, value_list[i]));
    }
    return value_desc.join(", ");
  },
  getHelp(option) {
    let desc = this.INI_OBJ.helps["HelpInfo"][option];
    if (desc != undefined) {
      let list = this.INI_OBJ.helps[`${option}_List`];
      if (list != undefined) {
        desc += "\n" + hightLightString(list);
      }
      return desc;
    }
    return option;
  },
};

GetINIfromXHR("./desc/NamesDesc.ini", (ini) => {
  RULES_DESC.INI_OBJ.names = ini;
});

GetINIfromXHR("./desc/OptionsDesc.ini", (ini) => {
  RULES_DESC.INI_OBJ.options = ini;
});
GetINIfromXHR("./desc/HelpInfor.ini", (ini) => {
  RULES_DESC.INI_OBJ.helps = ini;
});

export { RULES_DESC, GetINIfromXHR, Parser, ToString, ApplyRawString };
