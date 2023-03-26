// ------------------------ tips提示框开始 ------------------------
const tipsElement = {
  tips: document.querySelector("#tips"),
  lastTarget: undefined,
  lastElement: undefined,
  lastApi: undefined,
  closed: false,
  content: {
    op1: document.querySelector("#tips #option .a"),
    bg: document.querySelector("#tips #bg"),
    op2: document.querySelector("#tips #option .b"),
    info: document.querySelector("#tips #info"),
  },
  itemEvent(e) {
    const obj = tipsElement;
    if (obj.lastTarget == e.target) {
      return;
    } else {
      obj.lastTarget = e.target;
      obj.lastApi = e.view.EDIT_AREA_OBJ;
      obj.setTips();
      obj.moving();
    }
  },
  setTips() {
    if (this.lastTarget == undefined) return;
    this.lastApi.lastTarget = this.lastTarget;

    this.lastElement = this.lastTarget.parentNode;
    if (!this.lastElement.classList.contains("item-wrapper")) {
      this.lastElement = this.lastTarget.parentNode.parentNode.parentNode;
    }

    try {
      let infoItem = this.lastElement.children[0];
      this.content.op1.textContent = infoItem.children[0].textContent;
      this.content.op2.textContent = infoItem.children[1].textContent;
      this.content.info.innerHTML = RULES_DESC_OBJECT.getHelp(
        infoItem.children[1].textContent
      ).replace(/\\n/g, "\n");
      this.content.info.scrollTo(0, 0);
    } catch (err) {
      console.log(this.lastElement);
      console.log(err);
    }
    this.closed = false;
    this.showTips("1");
  },
  moving() {
    if (this.lastApi == undefined) return;
    if (this.lastApi.editMode) this.lastApi.setItemBgPos();

    let pos = this.lastApi.getItemAbsPos(this.lastElement);
    let x = pos.x + this.lastElement.offsetWidth / 2 - 500;
    // console.log(this.lastElement.clientWidth);
    if (this.lastElement.clientWidth < 1400) {
      x = pos.x + this.lastElement.offsetWidth / 2 - 240;
    }
    if (this.lastElement.clientWidth < 800) {
      x = pos.x + this.lastElement.offsetWidth / 2;
    }
    this.tips.style.left = `calc(${x}px - var(--tip_w) /2)`;
    if (pos.y > window.innerHeight / 2) {
      this.tips.style.top = `calc(${pos.y}px - var(--tip_h) - 4px)`;
      this.content.bg.setAttribute("class", "tips-bottom");
    } else {
      this.tips.style.top = `calc(${pos.y}px + 45px)`;
      this.content.bg.setAttribute("class", "tips-top");
    }

    if (pos.y < window.innerHeight - 50 && pos.y > 50 && !this.closed) {
      this.showTips("1");
    } else {
      this.showTips("0");
    }
  },
  showTips(t) {
    const tips = tipsElement.tips;
    if (t == "0") {
      tips.style["pointer-events"] = "none";
    } else {
      tips.style["pointer-events"] = "auto";
    }
    tips.style.opacity = t;
  },
};
document.querySelector("#tips #hiddenBtn").addEventListener("click", () => {
  tipsElement.closed = true;
  tipsElement.showTips("0");
});
