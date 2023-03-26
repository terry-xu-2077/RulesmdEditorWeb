function getParent(self, className = "edit-op-va") {
  if (self.classList.contains(className)) {
    return self;
  }
  let parentNode = self.parentNode;
  let num = 0;
  while (!parentNode.classList.contains(className)) {
    if (num > 10) break;
    parentNode = parentNode.parentNode;
    num += 1;
  }
  return parentNode;
}

function getBro(self, parentClass, broClass) {
  let parent = getParent(self, parentClass);
  return parent.querySelector(`.${broClass}`);
}

KEYS = {
  WG: {
    SIDE: "edit-wg-sideSelect",
    SIDE_WIN: "edit-wg-side-select-win",
    MULTI: "edit-wg-multiSelect",
    MULTI_WIN: "edit-wg-multi-select-win",
    INPUT: "edit-wg-default",
    CHECK: "edit-wg-check",
    DROP: "edit-wg-drop",
    SLIDER: "edit-wg-slider",
  },
  ELE: {
    TIP_TEXT: "edit-tooltip",
    INPUT_TEXT: "edit-text",
    MULTI_BTN: "multiBtn",
    SIDE_BTN: "sideBtn",
    DROP_LIST: "droplist",
    DROP_BTN: "dropbtn",
    SLID_NUM: "wg-number",
  },
};

ANI_CLASS = {
  WIN_OPEN: ["edit-win-open-in", "edit-win-open-out"],
  WIN_CLOSE: ["edit-win-close-OUT", "edit-win-close-out"],
};

EDW_ELE = {
  side: document.querySelector(`.${KEYS.WG.SIDE}`),
  sideWin: document.querySelector(`#${KEYS.WG.SIDE_WIN}`),
  multi: document.querySelector(`.${KEYS.WG.MULTI}`),
  multiWin: document.querySelector(`#${KEYS.WG.MULTI_WIN}`),
  input: document.querySelector(`.${KEYS.WG.INPUT}`),
  check: document.querySelector(`.${KEYS.WG.CHECK}`),
  drop: document.querySelector(`.${KEYS.WG.DROP}`),
  slider: document.querySelector(`.${KEYS.WG.SLIDER}`),
};

EDW_API = {
  previewMode: false,
  descOBJ: undefined,
  change: {
    callback: undefined,
    getEvent(self, value) {
      let parent = getParent(self);
      parent.dataset.value = value;
      this.callback(parent);
    },
  },
  parent: {
    element: undefined,
    isDown(y) {
      if (y > this.element.clientHeight / 2) return true;
      return false;
    },
    isOverflow(pos) {
      if (pos.y < this.element.clientHeight && pos.y > 0) {
        return false;
      } else {
        return true;
      }
    },
    setTop(self, target, padding = 0) {
      let y = 0;
      let targetRect = target.getBoundingClientRect();

      if (targetRect.top > this.element.clientHeight / 2) {
        y = target.clientHeight + self.clientHeight + padding;
      }
      target.style["bottom"] = `${y}px`;
    },
    getOffset(self, target, padding) {
      let x =
        self.getBoundingClientRect().left +
        self.clientWidth / 2 -
        target.clientWidth / 2; // - target.clientWidth / 2 + self.clientWidth / 2;
      let y = self.getBoundingClientRect().top;
      if (this.isDown(y)) {
        y -= target.clientHeight + padding;
      } else {
        y += self.clientHeight + padding;
      }
      return { x: x, y: y };
    },
  },
  text: {
    change(self) {
      EDW_API.change.getEvent(self, self.value);
    },
    resetValue(self) {
      let input = getBro(self, KEYS.WG.INPUT, KEYS.ELE.INPUT_TEXT);
      input.value = getParent(self).dataset.raw_value;
      EDW_API.change.getEvent(input, input.value);
    },
  },
  side: {
    win: EDW_ELE.sideWin,
    isOpen: false,
    eventBtn: undefined,
    open(self) {
      if (EDW_API.previewMode) return;
      if (EDW_API.side.isOpen) {
        setClassAnimation(EDW_API.side.win, ANI_CLASS.WIN_CLOSE, 500, false);
        EDW_API.side.eventBtn = undefined;
        EDW_API.side.isOpen = false;
        return;
      }
      EDW_API.side.isOpen = true;
      EDW_API.side.eventBtn = self;
      let pos = EDW_API.parent.getOffset(self, this.win, 4);

      EDW_API.side.win.style.left = `${pos.x}px`;
      EDW_API.side.win.style.top = `${pos.y}px`;

      setClassAnimation(EDW_API.side.win, ANI_CLASS.WIN_OPEN, 500);

      EDW_API.side.win.style["pointer-events"] = "auto";
      EDW_API.side.win.children[0].textContent = self.dataset.title;
      let data_value = EDW_API.side.eventBtn.dataset.value;
      let check_list = Array.prototype.slice.call(
        EDW_API.side.win.children[1].children
      );
      check_list.forEach((check) => {
        if (!data_value.includes(check.dataset.value)) {
          check.checked = false;
        } else {
          check.checked = true;
        }
      });
    },
    submit(mode) {
      if (mode) {
        if (EDW_API.side.eventBtn != undefined) {
          let check_list = Array.prototype.slice.call(
            EDW_API.side.win.children[1].children
          );
          let data_names = [];
          let data_value = [];
          check_list.forEach((check) => {
            if (check.checked) {
              data_names.push(check.dataset.name);
              data_value.push(check.dataset.value);
            }
          });
          EDW_API.side.eventBtn.children[0].textContent = data_names.join(", ");
          EDW_API.side.eventBtn.dataset.value = data_value.join(",");
          let toolTip = getBro(
            EDW_API.side.eventBtn,
            KEYS.WG.SIDE,
            KEYS.ELE.TIP_TEXT
          );
          toolTip.textContent = data_names.join(", ");
        }

        let raw_value = getParent(EDW_API.side.eventBtn).dataset.raw_value;
        let changed = EDW_API.multi.valueChanged(
          EDW_API.side.eventBtn.dataset.value,
          raw_value
        );
        if (changed) {
          EDW_API.change.getEvent(
            EDW_API.side.eventBtn,
            EDW_API.side.eventBtn.dataset.value
          );
        } else {
          EDW_API.change.getEvent(EDW_API.side.eventBtn, raw_value);
        }
      }

      setClassAnimation(EDW_API.side.win, ANI_CLASS.WIN_CLOSE, 500, false);
      EDW_API.side.isOpen = false;
    },
    setValue(widget, data_value) {
      let data_names = [];
      let btn = widget.querySelector(`.${KEYS.ELE.SIDE_BTN}`);
      let check_list = Array.prototype.slice.call(
        EDW_API.side.win.children[1].children
      );
      check_list.forEach((check) => {
        if (data_value.includes(check.dataset.value))
          data_names.push(check.dataset.name);
      });
      btn.dataset.value = data_value;
      btn.children[0].textContent = data_names.join(", ");

      let tooltip = getBro(widget, KEYS.WG.SIDE, KEYS.ELE.TIP_TEXT);
      tooltip.textContent = data_names.join(", ");
    },
    resetValue(self) {
      let top = getParent(self);
      let btn = getBro(self, KEYS.WG.SIDE, KEYS.ELE.SIDE_BTN);
      let toopTip = getBro(self, KEYS.WG.SIDE, KEYS.ELE.TIP_TEXT);
      btn.dataset.value = top.dataset.raw_value;
      btn.children[0].textContent = EDW_API.descOBJ.getMultiValueDesc(
        top.dataset.option,
        top.dataset.raw_value
      );
      toopTip.textContent = btn.children[0].textContent;
      EDW_API.change.getEvent(btn, top.dataset.raw_value);
    },
    scrolly() {
      if (this.eventBtn != undefined) {
        let pos = EDW_API.parent.getOffset(this.eventBtn, this.win, 4);
        this.win.style.left = `${pos.x}px`;
        this.win.style.top = `${pos.y}px`;
        setClassAnimation(EDW_API.side.win, ANI_CLASS.WIN_CLOSE, 500, false);
        this.isOpen = false;
      }
    },
  },
  check: {
    click(self) {
      if (EDW_API.previewMode) return;
      let v = self.dataset.value;
      //yes-no
      if (v == "yes" || v == "no") {
        if (self.checked) {
          self.dataset.value = "yes";
        } else {
          self.dataset.value = "no";
        }
        //true-false
      } else if (v == "true" || v == "false") {
        if (self.checked) {
          self.dataset.value = "true";
        } else {
          self.dataset.value = "false";
        }
      }
      EDW_API.change.getEvent(self, self.dataset.value);
    },
    resetValue(self) {
      let widget = getParent(self, KEYS.WG.CHECK);
      let top = getParent(self);
      EDW_API.check.setValue(widget, top.dataset.raw_value);
      EDW_API.change.getEvent(self, top.dataset.raw_value);
    },
    setValue(widget, v) {
      //yes-no
      widget.children[0].dataset.value = v;
      if (v == "yes" || v == "true") {
        widget.children[0].checked = true;
      } else {
        widget.children[0].checked = false;
      }
    },
  },
  drop: {
    children: [],
    click(self) {
      if (EDW_API.previewMode) return;
      let list = getBro(self, KEYS.WG.DROP, KEYS.ELE.DROP_LIST);
      if (list.style.opacity != "1") {
        EDW_API.parent.setTop(self, list, 8);
        list.style["pointer-events"] = "auto";
        list.style.opacity = "1";
      } else {
        list.style.opacity = "0";
        list.style["pointer-events"] = "none";
      }
    },
    itemClick(self) {
      let btn = getBro(self, KEYS.WG.DROP, KEYS.ELE.DROP_BTN);
      btn.children[0].textContent = self.textContent;
      btn.dataset.select = self.dataset.id;

      self.parentNode.style.opacity = "0";
      self.parentNode.style["pointer-events"] = "none";
      btn.dataset.value = self.dataset.value;
      EDW_API.change.getEvent(btn, btn.dataset.value);
    },
    add(obj, value, desc) {
      let child = obj.children[1].lastElementChild;
      let item = child.cloneNode(true);
      if (child.dataset.id == "-1") {
        obj.children[1].removeChild(child);
        item.dataset.id = "0";
        item.removeAttribute("style");
      } else {
        item.dataset.id = parseInt(item.dataset.id) + 1;
      }
      item.textContent = desc == undefined ? value : desc;
      item.dataset.value = value;
      obj.children[1].appendChild(item);
    },
    resetValue(self) {
      let top = getParent(self);
      let btn = getBro(self, KEYS.WG.DROP, KEYS.ELE.DROP_BTN);
      btn.dataset.value = top.dataset.raw_value;
      btn.dataset.select = "-1";
      btn.children[0].textContent = EDW_API.descOBJ.getSingleValueDesc(
        top.dataset.option,
        top.dataset.raw_value
      );
      EDW_API.change.getEvent(btn, top.dataset.raw_value);
    },
    scrolly() {
      this.children.forEach((list) => {
        list.style.opacity = "0";
        list.style["pointer-events"] = "none";
      });
    },
  },
  slider: {
    change(self) {
      self.parentNode.children[1].value = self.value;
      EDW_API.change.getEvent(self, self.value);
    },
    numChange(self) {
      self.parentNode.children[0].value = self.value;
      EDW_API.change.getEvent(self, self.value);
    },
    resetValue(self) {
      let top = getParent(self);
      let num = getBro(self, KEYS.WG.SLIDER, KEYS.ELE.SLID_NUM);
      num.value = top.dataset.raw_value;
      num.parentNode.children[0].value = num.value;
      EDW_API.change.getEvent(self, top.dataset.raw_value);
    },
  },
  multi: {
    eventBtn: undefined,
    isOpen: false,
    win: EDW_ELE.multiWin,
    open(self) {
      if (EDW_API.previewMode) return;
      if (EDW_API.multi.isOpen) {
        setClassAnimation(EDW_API.multi.win, ANI_CLASS.WIN_CLOSE, 500, false);
        EDW_API.multi.eventBtn = undefined;
        EDW_API.multi.isOpen = false;
        return;
      }

      EDW_API.multi.isOpen = true;
      EDW_API.multi.eventBtn = self;
      let pos = EDW_API.parent.getOffset(self, this.win, 4);

      EDW_API.multi.win.style.left = `${pos.x}px`;
      EDW_API.multi.win.style.top = `${pos.y}px`;

      EDW_API.multi.win.children[0].textContent = self.dataset.title;
      let data_value = EDW_API.multi.eventBtn.dataset.value;
      EDW_API.multi.addItems(self);
      check_list = Array.prototype.slice.call(
        EDW_API.multi.win.children[1].children
      );

      //设置选中状态
      check_list.forEach((check) => {
        if (!data_value.includes(check.dataset.value)) {
          check.checked = false;
        } else {
          check.checked = true;
        }
      });

      let toolTip = getBro(self, KEYS.WG.MULTI, KEYS.ELE.TIP_TEXT);
      toolTip.textContent = self.children[0].textContent;

      setClassAnimation(EDW_API.multi.win, ANI_CLASS.WIN_OPEN, 500);
    },
    add(value, desc) {
      let child = this.win.children[1].lastElementChild;
      let item = child.cloneNode(true);
      if (child.dataset.id == "-1") {
        this.win.children[1].removeChild(child);
        item.dataset.id = "0";
        item.removeAttribute("style");
      } else {
        item.dataset.id = parseInt(item.dataset.id) + 1;
      }

      if (desc.includes("$-")) {
        desc = desc.replace(`$-`, ``);
        item.classList.add("edit-typeOption");
      } else {
        item.classList.remove("edit-typeOption");
      }

      item.dataset.desc = desc == undefined ? value : desc;
      item.dataset.value = value;
      item.checked = false;
      this.win.children[1].appendChild(item);
    },
    addItems(self) {
      //生成选项组
      let check_list = Array.prototype.slice.call(
        EDW_API.multi.win.children[1].children
      );
      for (let i in check_list) {
        if (i == check_list.length - 1) break;
        check_list[i].remove();
      }
      let lastChild = this.win.children[1].lastElementChild;
      lastChild.dataset.id = "-1";

      option_list = EDW_API.descOBJ.getMultiOptionList(self.dataset.option);
      for (let key in option_list) {
        let desc = option_list[key];

        EDW_API.multi.add(key, desc != "" ? desc : key);
      }
      return check_list;
    },
    itemClick(self) {},
    valueChanged(a, b) {
      let re = /\,/g;

      try {
        if (a.match(re).length != b.match(re).length) {
          return true;
        }
      } catch (err) {
        return true;
      }

      let list = a.split(",");
      for (i in list) {
        if (!b.includes(list[i])) {
          return true;
        }
      }
      return false;
    },
    submit(mode) {
      if (mode) {
        if (EDW_API.multi.eventBtn != undefined) {
          let check_list = Array.prototype.slice.call(
            EDW_API.multi.win.children[1].children
          );
          let data_descs = [];
          let data_value = [];
          check_list.forEach((element) => {
            if (element.checked) {
              data_descs.push(element.dataset.desc);
              data_value.push(element.dataset.value);
            }
          });
          EDW_API.multi.eventBtn.children[0].textContent =
            data_descs.join(", ");
          EDW_API.multi.eventBtn.dataset.value = data_value.join(",");
          let toolTip = getBro(
            EDW_API.multi.eventBtn,
            KEYS.WG.MULTI,
            KEYS.ELE.TIP_TEXT
          );
          toolTip.textContent = data_descs.join(", ");
        }

        let raw_value = getParent(EDW_API.multi.eventBtn).dataset.raw_value;
        let changed = EDW_API.multi.valueChanged(
          EDW_API.multi.eventBtn.dataset.value,
          raw_value
        );
        if (changed) {
          EDW_API.change.getEvent(
            EDW_API.multi.eventBtn,
            EDW_API.multi.eventBtn.dataset.value
          );
        } else {
          EDW_API.change.getEvent(EDW_API.multi.eventBtn, raw_value);
        }
      }

      setClassAnimation(EDW_API.multi.win, ANI_CLASS.WIN_CLOSE, 500, false);
      EDW_API.multi.isOpen = false;
    },
    resetValue(self) {
      let top = getParent(self);
      let btn = getBro(self, KEYS.WG.MULTI, KEYS.ELE.MULTI_BTN);
      let toopTip = getBro(self, KEYS.WG.MULTI, KEYS.ELE.TIP_TEXT);
      btn.dataset.value = top.dataset.raw_value;
      console.log(top.dataset.option, top.dataset.raw_value);
      btn.children[0].textContent = EDW_API.descOBJ.getMultiValueDesc(
        top.dataset.option,
        top.dataset.raw_value
      );
      toopTip.textContent = btn.children[0].textContent;
      EDW_API.change.getEvent(btn, top.dataset.raw_value);
    },
    scrolly() {
      if (this.eventBtn != undefined) {
        let pos = EDW_API.parent.getOffset(this.eventBtn, this.win, 4);
        this.win.style.left = `${pos.x}px`;
        this.win.style.top = `${pos.y}px`;
        this.isOpen = false;
        setClassAnimation(EDW_API.multi.win, ANI_CLASS.WIN_CLOSE, 500, false);
      }
    },
  },
};

window.addEventListener("load", (e) => {
  if (window.self === window.top) {
    document.body.style["visibility"] = "visible";
    EDW_API.parent.element = document.querySelector(".test-wrapper");
    ["选项1 ----------adssdsdsda", "选项2", "选项3", "选项4"].forEach(
      (text) => {
        EDW_API.drop.add(EDW_ELE.drop, text);
      }
    );
  }
});
