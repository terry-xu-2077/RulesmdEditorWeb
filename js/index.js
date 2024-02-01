let userChangedData = {};

// ------------------------ iframe ------------------------
var EDIT_AREA_OBJ, PREVIEW_AREA_OBJ;
const iframeObj = {
  frameEdit: document.querySelector("#editArea"),
  framePreivew: document.querySelector("#previewArea"),
  preSize: 0,
  setPercentWidth(p) {
    let w = window.innerWidth * p - sidePullBtn.expand; //编辑区绝对位置
    let a = w / (window.innerWidth - sidePullBtn.expand);
    let b = 1 - a;
    this.preSize = b;
    this.frameEdit.style.width = `${a * 100}%`;
    this.framePreivew.style.width = `${b * 100}%`;
  },
  onItemChanged(self) {
    let section = EDIT_AREA_OBJ.elements.name2.textContent;
    let resetBtn = self.querySelector(".resetBtn");
    let status = userChangedData.changedOption(
      section,
      self.dataset.option,
      self.dataset.value
    );

    switch (status) {
      case "changed":
        //console.log(resetBtn, status, self.dataset.option);
        resetBtn.classList.add("resetBtn-show");
        resetBtn.classList.remove("resetBtn-hidden");
      case "noChange":
        resetBtn.classList.add("resetBtn-hidden");
        resetBtn.classList.remove("resetBtn-show");
    }
  },
  getLastValue(uiname, option, editMod) {
    //返回最新的value，如果changed或deleted里面有，则为最新
    let raw_value = userChangedData.getRawValue(uiname, option);

    if (editMod) {
      let userValue = userChangedData.getLastValue(uiname, option);
      if (userValue != undefined) {
        return [raw_value, userValue[0]];
      }
    }
    return [raw_value, raw_value];
  },
  onCopyCallBack(target, option, raw_value, value) {
    console.log(target, option, raw_value, value);
    EDIT_AREA_OBJ.addCloneOption(target);
  },
  addItems(API, li, refAPI) {
    //设置顶部名字和图标
    API.setIcon(li.children[0].dataset.uiname);
    API.setUIName(li.children[0].dataset.uiname);
    API.setDescName(li.children[0].textContent);
    //填充数据到编辑区
    if (userChangedData.textDataObj == undefined) return;
    let uiname = li.children[0].dataset.uiname;
    API.removeOptions();

    //循环添加项目
    let refList = [];
    if (refAPI.fixed) {
      let items =
        refAPI.parent.contentWindow.document.querySelectorAll(".edit-op-va");
      let keys = Object.keys(userChangedData.textDataObj[uiname]);
      let KeysLength = keys.length;
      let emptyItems = [];

      items.forEach((item) => {
        if (item.dataset.type == "empty") {
          emptyItems.push(item);
        } else {
          let op = item.dataset.option;
          refList.push(op);
          let find = keys.indexOf(op);
          if (find != -1) {
            keys.splice(find, 1);
          }
        }
      });

      for (let i in emptyItems) {
        emptyItems[i].remove();
      }

      for (let x in refList) {
        let key = refList[x];
        let values = this.getLastValue(uiname, key, API.editMode);

        if (values[0] == undefined) {
          //表示没有这个option， key应该是refKey
          API.addEmpty();
        } else {
          let desc = INI_LIB.RULES_DESC.getOption(key);
          API.addOption(desc, key, values[0], values[1], this.onCopyCallBack);
        }
      }
      if (keys.length > 0) {
        //大于0 说明 key 比 reflist 长，要调整refAPI的flexbox
        for (let x in keys) {
          let key = keys[x];
          let values = this.getLastValue(uiname, key, API.editMode);

          let desc = INI_LIB.RULES_DESC.getOption(key);
          API.addOption(desc, key, values[0], values[1], this.onCopyCallBack);
        }
        refAPI.setFlexBox(keys.length);
      } else {
        API.setFlexBox(refList.length - KeysLength);
      }
    } else {
      refList = Object.keys(userChangedData.textDataObj[uiname]);
      for (let x in refList) {
        let key = refList[x];
        let values = this.getLastValue(uiname, key, API.editMode);
        let desc = INI_LIB.RULES_DESC.getOption(key);
        API.addOption(desc, key, values[0], values[1], this.onCopyCallBack);
      }
    }

    //对比修改数据,如果在changed里找到则显示按钮
    if (API.editMode) {
      let items = API.elements.editList.querySelectorAll(".edit-op-va");
      items.forEach((obj) => {
        this.onItemChanged(obj);
      });
    }

    API.setScrollToTop();
    API.setAnimate();
  },
  onloadEdit() {
    EDIT_AREA_OBJ = this.frameEdit.contentWindow.EDIT_AREA_OBJ;
    EDIT_AREA_OBJ.descObj = INI_LIB.RULES_DESC;
    EDIT_AREA_OBJ.parent = this.frameEdit;
    this.frameEdit.contentWindow.setEdit_EDW_API(
      this.onItemChanged,
      INI_LIB.RULES_DESC
    );
    EDIT_AREA_OBJ.elements.editBottom.addEventListener("scroll", (e) => {
      EDIT_AREA_OBJ.resetFloatElement(e.target);
    });
  },
  onloadPreivew() {
    PREVIEW_AREA_OBJ = this.framePreivew.contentWindow.EDIT_AREA_OBJ;
    PREVIEW_AREA_OBJ.descObj = INI_LIB.RULES_DESC;
    PREVIEW_AREA_OBJ.parent = this.framePreivew;
    PREVIEW_AREA_OBJ.editMode = false;
    PREVIEW_AREA_OBJ.setPreviewMode();
    this.framePreivew.contentWindow.previewTheme();

    PREVIEW_AREA_OBJ.elements.editBottom.addEventListener("scroll", (e) => {
      PREVIEW_AREA_OBJ.resetFloatElement(e.target);
    });
  },
};
iframeObj.frameEdit.addEventListener("load", () => {
  iframeObj.onloadEdit();
});
iframeObj.framePreivew.addEventListener("load", () => {
  iframeObj.onloadPreivew();
});
window.addEventListener("resize", () => {
  editSplitBar.resizeBar();
});
// ------------------------ iframe ------------------------

// ------------- 分割条对象 -------------
const editSplitBar = {
  bg: document.querySelector("#editSplitBar"),
  bar: document.querySelector("#editSplitBar .bar"),
  w: 16, //bar宽度
  x: 0, //鼠标位置减去bar的位置
  offsetX: window.innerWidth, //最终偏移量
  percentX: 1 - 16 / window.innerWidth,
  percentW: 16 / window.innerWidth,
  drop: false,
  moveBar() {
    this.bar.style.left = `${this.percentX * 100}%`;
    iframeObj.setPercentWidth(this.percentX + this.percentW);
  },
  resizeBar() {
    this.percentW = this.w / window.innerWidth;
    let rel_right = Math.floor(window.innerWidth * (1 - this.percentX));
    if (rel_right <= this.w * 4) {
      this.offsetX = window.innerWidth;
      this.percentX = 1 - this.w / window.innerWidth;
    } else {
      this.offsetX = window.innerWidth - rel_right;
      this.percentX = this.offsetX / window.innerWidth;
    }
    this.moveBar();
  },
  mouseDown(e) {
    const obj = editSplitBar;
    obj.x = e.clientX - getAbsPos.left(obj.bar);
    obj.drop = true;
    obj.bg.style["pointer-events"] = "all";
  },
  mouseMove(e) {
    const obj = editSplitBar;
    if (obj.drop) {
      let x = e.clientX - obj.x;
      if (x > sidePullBtn.expand && x < window.innerWidth - obj.w) {
        obj.offsetX = x;
        obj.percentX = obj.offsetX / window.innerWidth;
        obj.moveBar();
      }
    } else {
      return;
    }
  },
  mouseUp(e) {
    const obj = editSplitBar;
    obj.drop = false;
    obj.bg.style["pointer-events"] = "none";
  },
};
editSplitBar.bar.addEventListener("mousedown", editSplitBar.mouseDown);
document.addEventListener("mousemove", editSplitBar.mouseMove);
document.addEventListener("mouseup", editSplitBar.mouseUp);
// ------------- 分割条对象 -------------

//侧边抽屉按钮
const sidePullBtn = {
  own: document.querySelector("#sidePullBtn"),
  expand: 0,
  setStatus() {
    const edit = document.querySelector("#editWrapper #iframes");
    const fold = document.querySelector("#unitFoldBox");
    edit.style["margin-left"] =
      edit.style["margin-left"] != `var(--leftMenu)`
        ? `var(--leftMenu)`
        : "0px";

    if (fold.style["left"] != "0px") {
      fold.style["left"] = "0px";
      sidePullBtn.expand = 180;
    } else {
      fold.style["left"] = `calc(var(--leftMenu) * -1)`;
      sidePullBtn.expand = 0;
    }
    editSplitBar.moveBar();
  },
};
sidePullBtn.own.addEventListener("click", () => {
  sidePullBtn.setStatus();
});
sidePullBtn.setStatus();

//单位折叠栏
const fold_m1_box = document.querySelectorAll(".fold-m1-box");
let last_m1_li = undefined;
//循环折叠栏
fold_m1_box.forEach((m1_box) => {
  const ul_items = m1_box.children[1];
  ul_items.style.display = "none";

  //设置li被点击后的操作
  for (let i = 0; i < ul_items.children.length; i++) {
    let li = ul_items.children[i];
    li.addEventListener("click", () => {
      if (last_m1_li != undefined) {
        last_m1_li.classList.toggle("li-click");
      }
      li.classList.toggle("li-click");
      last_m1_li = li;
    });
  }
  //设置折叠栏被点击后的操作
  m1_box.children[0].addEventListener("click", () => {
    m1_box.children[0].classList.toggle("fold-expand");
    m1_box.children[0].classList.toggle("fold-collapse");
    ul_items.style.display =
      ul_items.style.display == "none" ? "block" : "none";
  });
});
//搜索单位
const search_unit_input = document.querySelector("#search_unit input");
const search_unit_li = document.querySelectorAll("#search_unit li");
search_unit_input.addEventListener("change", () => {
  TYPE_FOLD_OBJ.setFilter(search_unit_input.value);
});
search_unit_li.forEach((li) => {
  li.addEventListener("mousedown", () => {
    search_unit_input.value = li.textContent;
    TYPE_FOLD_OBJ.setFilterDeluxe(li.dataset.type);
  });
});
//全局展开函数
let fold_all_status = "fold-expand";
function setFoldAll(expand) {
  let fold_box_add = "";
  let fold_box_remove = "";
  if (expand) {
    fold_box_add = "fold-collapse";
    fold_box_remove = "fold-expand";
    leftTopBtn.children[0].classList.add("fold-collapse");
    leftTopBtn.children[0].classList.remove("fold-expand");
  } else {
    fold_box_remove = "fold-collapse";
    fold_box_add = "fold-expand";
    leftTopBtn.children[0].classList.add("fold-expand");
    leftTopBtn.children[0].classList.remove("fold-collapse");
  }
  fold_m1_box.forEach((m1_box) => {
    m1_box.children[0].classList.add(fold_box_add);
    m1_box.children[0].classList.remove(fold_box_remove);
    m1_box.children[1].style.display =
      fold_box_add == "fold-collapse" ? "block" : "none";
  });
}
//全局折叠按钮
const leftTopBtn = document.querySelector("#leftTop");
leftTopBtn.children[0].addEventListener("click", () => {
  if (fold_all_status == "fold-expand") {
    fold_all_status = "fold-collapse";
    setFoldAll(true);
  } else {
    fold_all_status = "fold-expand";
    setFoldAll(false);
  }
});
//顶部右侧压缩按钮
const barsBtn = document.querySelector("#barsBtn");
const topRight = document.querySelector("#topRight");
barsBtn.addEventListener("click", () => {
  topRight.style.bottom =
    topRight.style.bottom != "0px" ? "0px" : "calc(var(--btn_h) * 1.2 * -4)";
});
window.addEventListener("resize", () => {
  topRight.style.bottom = "calc(var(--btn_h) * 1.2 * -4)";
});

RULES_OBJ = {
  data: undefined,
};

function newFile() {
  AjaxGet(
    "rulesmd.pre",
    (ini) => {
      loadFile(ini);
    },
    "TEXT"
  );
}

function openFile() {
  //https://developer.mozilla.org/zh-CN/docs/Web/API/File_API/Using_files_from_web_applications
  let input = document.createElement("input");
  input.type = "file";
  input.accept = ".ini,.xdp";
  input.onchange = (e) => {
    let reader = new FileReader();
    reader.readAsText(input.files[0]);
    reader.onload = (e) => {
      loadFile(reader.result);
    };
  };
  input.click();
}

function saveFile() {
  //https://www.cnblogs.com/sugartang/p/13778198.
  let content = userChangedData.finalText();
  if (content != undefined) {
    let blob = new Blob([content], { type: "text/plain" });
    let url = window.URL.createObjectURL(blob);
    saveDialog.open(url);
  }
}

loadFile = (text) => {
  userChangedData = new INI_LIB.TextDataEditor(text);
  fold_all_status = "fold-collapse";
  setFoldAll(true);
  TYPE_FOLD_OBJ.clearItems();
  INI_LIB.RULES_DESC.GEN_INI.rulesINI = userChangedData.textDataObj;
  INI_LIB.RULES_DESC.GEN_INI.generate();
  TYPE_FOLD_OBJ.AddItems("InfantryTypes", userChangedData.textDataObj);
  TYPE_FOLD_OBJ.AddItems("VehicleTypes", userChangedData.textDataObj);
  TYPE_FOLD_OBJ.AddItems("AircraftTypes", userChangedData.textDataObj);
  TYPE_FOLD_OBJ.AddItems("BuildingTypes", userChangedData.textDataObj);
  TYPE_FOLD_OBJ.AddItems("SuperWeaponTypes", userChangedData.textDataObj);
};

// ---------------------------------- ON LOAD ----------------------------------

window.addEventListener("load", () => {
  //绑定滚动
  EDIT_AREA_OBJ.elements.editBottom.addEventListener("scroll", (e) => {
    PREVIEW_AREA_OBJ.elements.editBottom.scrollTop =
      EDIT_AREA_OBJ.elements.editBottom.scrollTop;
  });

  const unitFilterDeluxe = {
    Allied(uiname) {
      try {
        if (parseFloat(userChangedData.textDataObj[uiname]["TechLevel"]) == -1)
          return false;
        if (userChangedData.textDataObj[uiname]["Prerequisite"] != undefined)
          return true;
        return false;
      } catch (err) {
        return false;
      }
    },
    Soviet(uiname) {
      try {
        if (parseFloat(userChangedData.textDataObj[uiname]["TechLevel"]) == -1)
          return false;
        if (userChangedData.textDataObj[uiname]["Prerequisite"] != undefined) {
          let Owner = userChangedData.textDataObj[uiname]["Owner"];
          if (Owner.indexOf("Russians") != -1) return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    },
    Yuri(uiname) {
      try {
        if (parseFloat(userChangedData.textDataObj[uiname]["TechLevel"]) == -1)
          return false;
        if (userChangedData.textDataObj[uiname]["Prerequisite"] != undefined)
          return true;
        return false;
      } catch (err) {
        return false;
      }
    },
    Tech(uiname) {
      try {
        if (parseFloat(userChangedData.textDataObj[uiname]["TechLevel"]) > -1)
          return true;
        return false;
      } catch (err) {
        return false;
      }
    },
  };

  TYPE_FOLD_OBJ = {
    types: {
      InfantryTypes: document.querySelector("#fold1 ul"),
      VehicleTypes: document.querySelector("#fold2 ul"),
      AircraftTypes: document.querySelector("#fold3 ul"),
      BuildingTypes: document.querySelector("#fold4 ul"),
      SuperWeaponTypes: document.querySelector("#fold5 ul"),
    },
    setFilter(searchKey) {
      this.clearFilter();
      if (searchKey == "") return;
      for (let types in this.types) {
        list = this.types[types].querySelectorAll("li");
        list.forEach((li) => {
          if (
            li.children[0].dataset.uiname.indexOf(searchKey) == -1 &&
            li.children[0].textContent.indexOf(searchKey) == -1
          ) {
            li.style.display = "none";
          } else {
            setFoldAll(true);
            fold_all_status = "fold-expand";
          }
        });
      }
    },
    setFilterDeluxe(dataType) {
      this.clearFilter();
      if (userChangedData.textDataObj == undefined) return;
      for (let types in this.types) {
        list = this.types[types].querySelectorAll("li");
        list.forEach((li) => {
          if (unitFilterDeluxe[dataType](li.children[0].dataset.uiname)) {
            setFoldAll(true);
            fold_all_status = "fold-expand";
          } else {
            li.style.display = "none";
          }
        });
      }
    },
    clearFilter() {
      setFoldAll(false);
      fold_all_status = "fold-collapse";
      for (let types in this.types) {
        list = this.types[types].querySelectorAll("li");
        list.forEach((li) => {
          li.style.display = "flex";
        });
      }
    },
    AddItems(types, rulesData) {
      this.types[types].innerHTML = "";
      for (let key in rulesData[types]) {
        let li = document.createElement("li");
        let name = rulesData[types][key].split(";")[0];

        if (rulesData[name] == undefined) continue;

        li.innerHTML = `<div data-uiname="${name}" class="name">${INI_LIB.RULES_DESC.getName(
          name.strip()
        )}</div><div class="id">${key}</div>`;

        // ---------- li的点击事件开始 ----------
        li.addEventListener("click", () => {
          if (last_m1_li != undefined) {
            last_m1_li.classList.toggle("li-click");
          }
          li.classList.toggle("li-click");
          last_m1_li = li;

          if (!EDIT_AREA_OBJ.fixed) {
            iframeObj.addItems(EDIT_AREA_OBJ, li, PREVIEW_AREA_OBJ);
          }

          if (iframeObj.preSize > 0) {
            if (!PREVIEW_AREA_OBJ.fixed) {
              iframeObj.addItems(PREVIEW_AREA_OBJ, li, EDIT_AREA_OBJ);
            }
          }
        });
        // ---------- li的点击事件结束 ----------

        this.types[types].appendChild(li);
      }
    },
    clearItems() {
      for (key in this.types) {
        this.types[key].innerHTML = "";
      }
    },
  };
});
