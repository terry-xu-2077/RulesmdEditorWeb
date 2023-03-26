const itemEffect = document.querySelector("#active-bg");
// for (let x = 0; x < 20; x++) {
//   itemEffect.children[0].appendChild(document.createElement("li"));
// }
const sameUINameIcon = {
  SENGINEER: "ENGINEER",
  YENGINEER: "ENGINEER",
  YADOG: "ADOG",
  YDOG: "DOG",
  HORV: "HARV",
  CMON: "CMIN",
  SMIN: "YAREFN",
  AMRADR: "GAAIRC",
};

var EDIT_AREA_OBJ = {
  parent: undefined,
  descObj: undefined,
  ownDoc: document,
  ownWin: window,
  editMode: true,
  fixed: false,
  lastElement: undefined,
  elements: {
    icon: document.querySelector("#itemIcon"),
    name1: document.querySelector("#itemName #n1"),
    name2: document.querySelector("#itemName #n2"),
    bgText: document.querySelector("#itemBox #bgText"),
    editList: document.querySelector("#editBottom #editList-1"),
    editBottom: document.querySelector("#editBottom"),
  },
  resetFloatElement(e) {
    return;
    if (e == EDIT_AREA_OBJ.elements.editBottom) {
      EDIT_AREA_OBJ.setItemBgPos();
    }
  },
  getItemAbsPos(item) {
    let pos = this.getItemPos(item);

    px = getAbsPos.left(this.parent);
    py = getAbsPos.top(this.parent);
    return { x: px + pos.x, y: py + pos.y };
  },
  getItemPos(item) {
    let left = getAbsPos.left(item);
    let top = getAbsPos.top(item) - this.getScrollTop();
    return { x: left, y: top };
  },
  getScrollTop() {
    return this.elements.editBottom.scrollTop;
  },
  setItemBgPos() {
    return;
    if (this.lastElement == undefined) return;
    itemEffect.style["opacity"] = "0";
    pos = this.getItemPos(this.lastElement);
    itemEffect.style["top"] = `${pos.y}px`;
    setTimeout(() => {
      itemEffect.style["opacity"] = "1";
    }, 200);
  },
  setPreviewMode() {
    this.editMode = false;
    const topArea = document.querySelector("#editTop");
    topArea.style["background-image"] = `var(--edit-top_preview)`;
    // itemEffect.style.display = "none";
  },
  setAnimate() {
    styleAnimate(
      this.elements.editList.children,
      ["edit-animation-in", "edit-animation-out"],
      6,
      2000
    );
  },
  setScrollToTop() {
    this.elements.editBottom.scrollTo(0, 0);
  },
  setIcon(uiname) {
    let pos = [60, 48];

    if (iconTilePos[uiname] == undefined) {
      uiname = sameUINameIcon[uiname];
    }

    if (iconTilePos[uiname] != undefined || uiname != undefined) {
      pos = iconTilePos[uiname].slice();
      pos[0] = -pos[0];
      pos[1] = -pos[1];
    }
    this.elements.icon.style[
      "background-position"
    ] = `calc(${pos[0]}px * var(--iconScale)) calc(${pos[1]}px * var(--iconScale))`;
  },
  setClickedItem(self) {
    EDIT_AREA_OBJ.lastElement = self;
    //EDIT_AREA_OBJ.setItemBgPos();
  },
  setUIName(uiname) {
    this.elements.name2.textContent = uiname;
    this.elements.bgText.textContent = uiname.toUpperCase();
  },
  setDescName(desc) {
    this.elements.name1.textContent = desc;
  },
  setFlexBox(scale) {
    let flexBox = this.elements.editList.querySelector(".edit-op-flexbox");
    if (this.elements.editList.querySelector(".edit-op-flexbox") == undefined) {
      let wigdet = document.createElement("div");
      wigdet.innerHTML = `<div class='edit-op-flexbox edit-animation-in' style="height:calc(var(--item_h) * ${scale});" data-option="" data-type="empty"></div>`;
      this.elements.editList.appendChild(wigdet.children[0]);
    } else {
      flexBox.style.height = `calc(var(--item_h) * ${scale})`;
    }
  },
  addEmpty() {
    let wigdet = document.createElement("div");
    wigdet.innerHTML = `<div class='edit-op-va edit-animation-in edit-op-empty' data-option="" data-type="empty" onclick="EDIT_AREA_OBJ.setClickedItem(this)">
            <div class="item-wrapper">
              <div class="edit-option"></div>
              <div class="edit-value"></div>
              </div>
            </div>`;
    this.elements.editList.appendChild(wigdet.children[0]);
  },
  addOption(desc, option, raw_value, value, copyCallBack = undefined) {
    let wigdet = document.createElement("div");
    let editValue = document.createElement("div");
    editValue.setAttribute("class", "edit-value");
    let widgetBack = this.getWidget(editValue, option, value, desc);

    raw_value = widgetBack[1] ? toUpperFirst(raw_value) : raw_value;
    value = widgetBack[1] ? toUpperFirst(value) : value;
    wigdet.innerHTML = `<div class='edit-op-va edit-animation-in' data-option="${option}" data-raw_value="${raw_value}" data-type="${widgetBack[0]}" data-value="${value}" onclick="EDIT_AREA_OBJ.setClickedItem(this)">
                <div class="item-wrapper">
                  <div class="edit-option">
                    <div class="a">${desc}</div>
                    <div class="b">${option}</div>
                  </div>
                </div>
              </div>`;
    if (!this.editMode) {
      let copyBtn = document.createElement("button");
      wigdet.children[0].appendChild(copyBtn);
      copyBtn.setAttribute("class", "copyBtn");
      copyBtn.addEventListener("click", () => {
        copyCallBack(copyBtn.parentNode, option, raw_value, value);
      });
    }
    wigdet.children[0].children[0].appendChild(editValue);
    this.elements.editList.appendChild(wigdet.children[0]);
  },
  addCloneOption(target) {
    let item = target.cloneNode(true);
    let btn = item.querySelector(".copyBtn");
    let rect = target.getBoundingClientRect();
    item.removeChild(btn);
    item.style.position = "absolute";
    item.style.top = `${rect.top}px`;
    item.style.left = "0";
    this.elements.editList.appendChild(item);
  },
  removeOptions() {
    this.elements.editList.innerHTML = "";
  },
  getWidget(parent, option, value, desc, normal = false) {
    if (!normal) {
      // 布尔值
      if ("BOOLE YES".includes(getStrType(value))) {
        let widget = EDW_ELE.check.cloneNode(true);
        EDW_API.check.setValue(widget, value);
        if (!this.editMode) {
          widget.children[0].disabled = true;
        }
        parent.appendChild(widget);
        return ["boole", false];
      }

      //选择国家
      if ("Owner RequiredHouses ForbiddenHouses".includes(option)) {
        let widget = EDW_ELE.side.cloneNode(true);
        widget.children[0].dataset.title = desc;
        EDW_API.side.setValue(widget, value);
        parent.appendChild(widget);
        return ["houses", false];
      }

      //单选列表
      option_list = this.descObj.getSingleOptionList(option);
      if (option_list != undefined) {
        let widget = EDW_ELE.drop.cloneNode(true);

        let value_desc = option_list[value];
        let toUpper = false;
        if (value_desc == undefined)
          value_desc = option_list[toUpperFirst(value)];
        if (value_desc != undefined) toUpper = true;
        if (value_desc == "") value_desc = value.toString();

        widget.children[0].children[0].textContent = value_desc;
        widget.children[0].dataset.value = toUpperFirst(value);
        widget.children[0].dataset.option = option;

        for (key in option_list) {
          let desc = option_list[key];
          EDW_API.drop.add(widget, key, desc != "" ? desc : key);
        }

        parent.appendChild(widget);
        EDW_API.drop.children.push(widget.children[1]);
        return ["single", toUpper];
      }

      //多选列表
      if (this.descObj.isMultiOptions(option) != "") {
        let toUpper = false;
        try {
          let option_list = this.descObj.getMultiOptionList(option);
          let descs = [];
          for (let key in option_list) {
            if (value.toUpperCase().includes(key)) {
              toUpper = true;
            }

            if (value.includes(key) || value.toUpperCase().includes(key)) {
              let text = option_list[key];
              if (text == undefined) text = key;
              descs.push(option_list[key]);
            }
          }

          if (toUpper) value = value.toUpperCase();
          let widget = EDW_ELE.multi.cloneNode(true);
          let data_descs = descs.join(", ");
          widget.children[0].children[0].textContent =
            data_descs != "" ? data_descs.replace("$-", "") : value;
          let lastID = widget.children.length - 2;
          widget.children[lastID].children[0].textContent =
            widget.children[0].children[0].textContent;
          widget.children[0].dataset.option = option;
          widget.children[0].dataset.title = desc;
          widget.children[0].dataset.value = value;
          widget.children[0].dataset.multi = value;
          parent.appendChild(widget);

          return ["multi", false];
        } catch (err) {
          console.log(err);
        }
      }

      // 如果是数字
      if (getStrType(value) == "NUM") {
        let widget = EDW_ELE.slider.cloneNode(true);
        let float = parseFloat(value);
        widget.children[0].min = 0;
        widget.children[0].max = float % 1 === 0 ? float * 4 : float * 6;
        widget.children[0].step = float % 1 === 0 ? 1 : 0.01;
        widget.children[0].value = float;
        widget.children[1].value = float;
        if (!this.editMode) {
          widget.children[0].disabled = true;
          widget.children[1].disabled = true;
        }
        parent.appendChild(widget);
        return ["number", false];
      }
    }

    //改文字颜色
    let widget = EDW_ELE.input.cloneNode(true);
    widget.children[0].dataset.value = value;

    if (!this.editMode) {
      widget.children[0].setAttribute("readonly", "readonly");
      widget.children[0].value = this.descObj.getMultiValueDesc(option, value);
    } else {
      widget.children[0].value = value;
      widget.children[0].dataset.value = value;
      widget.children[0].dataset.option = option;
    }
    parent.appendChild(widget);
    return ["text", false];
  },
  setFix(self) {
    EDIT_AREA_OBJ.fixed = self.checked;
  },
};

var EDW_ELE, EDW_API;
function load_EDW(self) {
  EDW_ELE = self.contentWindow.EDW_ELE;
  EDW_API = self.contentWindow.EDW_API;
  EDW_DOC = self.contentWindow.document;
  document.body.append(EDW_ELE.sideWin);
  document.body.append(EDW_ELE.multiWin);
  EDW_API.parent.element = EDIT_AREA_OBJ.elements.editBottom;
  EDIT_AREA_OBJ.elements.editBottom.addEventListener("scroll", (e) => {
    EDW_API.drop.scrolly();
    EDW_API.multi.scrolly();
    EDW_API.side.scrolly();
  });
}

setEdit_EDW_API = (wgCallback, descOBJ) => {
  if (EDIT_AREA_OBJ.editMode) {
    EDW_API.change.callback = wgCallback;
    EDW_API.descOBJ = descOBJ;
  }
};

previewTheme = () => {
  EDW_API.previewMode = true;
  document.documentElement.style["overflow-y"] = "hidden";
  document.documentElement.style.setProperty(
    `--ed-wg-main-color`,
    "var(--ed-wg-pre-main-color)"
  );
  document.documentElement.style.setProperty(
    `--ed-wg-check-on-bg`,
    `linear-gradient(90deg, var(--ed-wg-pre-main-color)  10%, var(--ed-wg-pre-main-light) 20%, var(--ed-wg-pre-main-color)  60%)`
  );
};
