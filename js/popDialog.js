dialogMask = {
  mask: document.querySelector("#popDialogGroup"),
  set(show) {
    if (show) {
      this.mask.classList.add("dialog-mask-show");
      this.mask.classList.remove("dialog-mask-hidden");
    } else {
      this.mask.classList.add("dialog-mask-hidden");
      this.mask.classList.remove("dialog-mask-show");
    }
  },
};
saveDialog = {
  dialog: document.querySelector("#saveDialog"),
  url_1: document.querySelector("#saveUrl1"),
  url_2: document.querySelector("#saveUrl2"),
  btn_ok: document.querySelector(".btn-ok"),
  isOpen: false,
  setUrl(url = undefined) {
    if (url != undefined) {
      this.url_1.href = url;
      this.url_2.href = url;
      this.url_1.setAttribute("download", "Rulesmd.ini");
      this.url_2.setAttribute("download", "spawner.xdp");
    } else {
      this.url_1.href = "";
      this.url_2.href = "";
      this.url_1.removeAttribute("download");
      this.url_2.removeAttribute("download");
    }
  },
  open(url) {
    this.setUrl(url);
    this.isOpen = true;
    setClassAnimation(this.dialog, ["dialog-open-in", "dialog-open-out"], 500);
    dialogMask.set(true);
  },
  close() {
    setClassAnimation(
      this.dialog,
      ["dialog-close-in", "dialog-close-out"],
      500,
      false
    );
    this.setUrl();
    dialogMask.set(false);
    this.isOpen = false;
  },
};
