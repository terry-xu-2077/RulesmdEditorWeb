// ---------------------------------------- TextDataEditor ----------------------------------------
//给字符串对象添加去首尾空格的方法
String.prototype.strip = function () {
  return this.replace(/^\s+|\s+$/g, "");
};
/**
 * 使用jsonData中的值替换text中匹配的键和子键
 * @param {Object} jsonData - 包含要替换的键值对的对象
 * @param {string} text - 要替换的文本
 * @returns {string} 替换后的文本
 */
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

/**
 * 将INI格式文本转换为对象
 * @param {string} text - 要转换的INI格式文本
 * @param {boolean} keepCommentedOptions - 是否保留被注释掉的选项，默认为false
 * @returns {Object} 转换后得到的对象
 */
function textToObject(text, keepCommentedOptions = false) {
  const lines = text.split("\n");
  let currentKey = "";
  const result = {};
  for (const line of lines) {
    if (line.startsWith("[")) {
      // 如果一行以 [ 开头，则表示这是一个新的键，创建一个新的键值对
      currentKey = line.slice(1, -1).replace("]", "").strip();
      result[currentKey] = {};
    } else if (line.includes("=")) {
      // 如果一行包含 =，则表示这是一个子键和值得定义，将其添加到当前键下面
      const [subKey, value] = line.strip().split("=");
      if (!keepCommentedOptions && subKey.trim().startsWith(";")) continue;
      result[currentKey][subKey.trim()] = value.split(";")[0].trim();
    }
  }
  //   console.log(result);
  return result;
}

/**
 * 根据jsonData中的数据删除或注释text中的某些行
 * @param {Object} jsonData - 包含要删除的键值对的对象
 * @param {string} text - 要删除行的文本
 * @param {boolean} commentOut - 是否将数据注释而不是真正删除
 * @returns {string} 删除后的文本
 */
function deleteLines(jsonData, text, commentOut = false) {
  const lines = text.split("\n");
  let currentKey = "";
  const result = [];
  for (const line of lines) {
    if (line.startsWith("[")) {
      // 如果一行以 [ 开头，则表示这是一个新的键，更新当前键值
      currentKey = line.slice(1, -1);
      result.push(line);
    } else if (line.includes("=")) {
      // 如果一行包含 =，则表示这是一个子键和值得定义，检查是否需要删除或注释
      const [subKey] = line.split("=");
      if (
        jsonData[currentKey] &&
        Object.keys(jsonData[currentKey]).includes(subKey.trim())
      ) {
        if (commentOut) {
          result.push(`;__DEL__;${line}`);
        }
        continue;
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }
  return result.join("\n");
}

/**
 * 删除整个 section
 * @param {string} section - 要删除的 section 名称
 * @param {string} text - 要删除行的文本
 * @returns {string} 删除后的文本
 */
function deleteSection(section, text) {
  const lines = text.split("\n");
  let currentKey = "";
  let inSection = false;
  const result = [];
  for (const line of lines) {
    if (line.startsWith("[")) {
      // 如果一行以 [ 开头，则表示这是一个新的键，更新当前键值
      currentKey = line.slice(1, -1);
      if (currentKey === section) {
        inSection = true;
        continue;
      } else {
        inSection = false;
        result.push(line);
      }
    } else if (!inSection) {
      result.push(line);
    }
  }
  return result.join("\n");
}

/**
 * 将对象转换为 INI 配置文本
 * @param {Object} obj - 要转换的对象
 * @returns {string} 转换后的 INI 配置文本
 */
function objectToIni(obj) {
  let result = "";
  for (const [section, options] of Object.entries(obj)) {
    result += `[${section}]\n`;
    for (const [option, value] of Object.entries(options)) {
      result += `${option}=${value}\n`;
    }
  }
  return result;
}

class TextDataEditor {
  constructor(rawText) {
    this.RAW_TEXT = rawText;
    this.textDataObj = textToObject(rawText);
    this.deleteData = {};
    this.changeData = {};
    this.deleteSectionFlag = [];
    this.newSectionFlag = [];
    this.dataList = [this.changeData, this.deleteData];
  }
  __addSection(data, section) {
    if (data[section] == undefined) {
      data[section] = {};
    }
    return;
  }
  __deleteSection(data, section) {
    if (this.__sectionOpitonInData(data, section)) {
      delete data[section];
    }
  }
  __deleteOption(data, section, option) {
    if (this.__sectionOpitonInData(data, section, option)) {
      delete data[section][option];
    }
  }
  __addOption(data, section, option, value) {
    this.__addSection(data, section);
    data[section][option] = value;
  }
  __sectionOpitonInData(data, section, option = "") {
    if (data[section] == undefined) return false;
    if (option == "") return true;
    if (data[section][option] == undefined) return false;
    return true;
  }
  clearChanged() {
    this.deleteData = {};
    this.changeData = {};
    this.deleteSectionFlag = [];
    this.newSectionFlag = [];
  }
  getRawValue(section, option) {
    if (this.__sectionOpitonInData(this.textDataObj, section, option)) {
      return this.textDataObj[section][option];
    }
    return;
  }
  getDataName(data) {
    if (data === this.changeData) return "changed";
    if (data === this.deleteData) return "deleted";
    return undefined;
  }
  getLastValue(section, option) {
    for (let i = 0; i < this.dataList.length; i++) {
      let data = this.dataList[i];
      if (this.__sectionOpitonInData(data, section, option)) {
        return [data[section][option], this.getDataName(data)];
      }
    }
  }
  changedOption(section, option, value) {
    //如果是一个源文件中存在的值，则添加到修改组
    if (this.__sectionOpitonInData(this.textDataObj, section, option)) {
      if (
        this.textDataObj[section][option].toLowerCase() == value.toLowerCase()
      ) {
        //如果值跟源文件相同，则没有任何的修改,从修改组中移除
        this.__deleteOption(this.changeData, section, option);
        return "noChange";
      }
      //存在option,但是value不一样，则修改
      this.__addSection(this.changeData, section);
      this.changeData[section][option] = value; // 键值对添加到修改组
      return "changed";
    } else {
      //如果数据在删除组里，则转移到修改组里
      if (this.__sectionOpitonInData(this.deleteData, section, option)) {
        this.changeData[section] = { option, value };
        this.__deleteOption(this.deleteData, section, option);
        return "resotre";
      }
      let x = "add:option";
      //值数据是全新的，不在源文件中
      this.changeData[section] = { option, value };
      //如果这个键不在源文件中，也是全新的
      if (!this.__sectionOpitonInData(this.textDataObj, section)) {
        this.newSectionFlag.push(section);
        x += "/section";
      }
      return x;
    }
  }
  removeOption(section, option, value) {
    try {
      this.__deleteOption(this.changeData, section, option);
      this.__addSection(this.deleteData, section);
      this.__addOption(this.deleteData, section, option, value);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  removeSection(section) {
    try {
      this.deleteSectionFlag.push(section);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  addSection(section, newData) {
    try {
      this.newSectionFlag.push(section);
      this.changeData[section] = newData;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  finalText() {
    try {
      let newText = replaceText(this.changeData, this.RAW_TEXT);
      newText = deleteLines(this.deleteData, newText);
      for (let x in this.deleteSectionFlag) {
        let flag = this.deleteSectionFlag[x];
        newText = deleteSection(flag, newText);
      }
      for (let x in this.newSectionFlag) {
        let flag = this.newSectionFlag[x];
        newText += objectToIni(this.changeData[flag]);
      }
      return newText;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
}

// ---------------------------------------- RULES_DESC ----------------------------------------

//异步请求GET
function GetINIfromXHR(url, callback, cache = true) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", encodeURI(url));
  if (!cache) {
    xhr.setRequestHeader("Cache-Control", "no-cache");
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(textToObject(xhr.responseText));
    }
  };
  xhr.send();
}

//高亮关键字
function hightLightString(obj) {
  let newText = "";
  for (let key in obj) {
    newText += `<span class="hight-light-words">${key}</span>\n${obj[key]}\n\n`;
  }
  return newText;
}

const DescGroup = {
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
        JSON.stringify(DescGroup.INI_OBJ.options["Buildings_List"])
      );
      for (let id in this.rulesINI["BuildingTypes"]) {
        let uiname = this.rulesINI["BuildingTypes"][id];
        if (this.filterTech(uiname)) {
          this.Buildings[uiname] = DescGroup.getName(uiname);
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
    if (DescGroup.isMultiOptions(option) != "") return undefined;
    return DescGroup.INI_OBJ.options[`${option}_List`];
  },
  getMultiOptionList(option) {
    let key = DescGroup.isMultiOptions(option);
    if (key != "") {
      if (key == "Buildings") {
        return DescGroup.GEN_INI.Buildings;
      }
      return DescGroup.INI_OBJ.options[`${key}_List`];
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
  DescGroup.INI_OBJ.names = ini;
});
GetINIfromXHR("./desc/OptionsDesc.ini", (ini) => {
  DescGroup.INI_OBJ.options = ini;
});
GetINIfromXHR("./desc/HelpInfor.ini", (ini) => {
  DescGroup.INI_OBJ.helps = ini;
});

export {
  DescGroup as RULES_DESC,
  GetINIfromXHR,
  TextDataEditor,
  textToObject as Parser,
  replaceText as EncodeINI,
};
