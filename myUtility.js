//获得所有成员列表
function getNodesNoNull(e) {
  let nodes = [];
  for (let i = 0; i < e.childNodes.length; ++i) {
    if (e.childNodes[i].tagName != undefined) {
      nodes.push(e.childNodes[i]);
    }
  }
  return nodes;
}

//异步请求GET
function AjaxGet(url, callback, type = "JSON", cache = true) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", encodeURI(url));
  if (!cache) {
    xhr.setRequestHeader("Cache-Control", "no-cache");
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let result = xhr.responseText;
      if (type == "JSON") {
        result = JSON.parse(result);
      }
      callback(result);
    }
  };
  xhr.send();
}

function downloadUrlFile(url, fileName) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", encodeURI(url));
  xhr.responseType = "blob";
  xhr.onload = () => {
    if (xhr.status === 200) {
      // 获取文件blob数据并保存
      var urlObject = window.URL || window.webkitURL || window;
      var export_blob = new Blob([xhr.response]);
      var save_link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a"
      );
      save_link.href = urlObject.createObjectURL(export_blob);
      save_link.download = fileName;
      save_link.click();
    }
  };

  xhr.send();
}

//给字符串对象添加去首尾空格的方法
String.prototype.strip = function () {
  return this.replace(/^\s+|\s+$/g, "");
};

//打乱数组
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let randomPos = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomPos]] = [array[randomPos], array[i]];
  }
}

//阻止子元素遮挡父级
function toAffect(obj1, ev, event) {
  var obj2 = null;
  if (ev.relatedTarget) {
    obj2 = ev.relatedTarget;
  } else {
    if (event == "mouseover") {
      obj2 = ev.fromElement;
    } else if (event == "mouseout") {
      obj2 = ev.toElement;
    }
  }
  if (obj1.contains) {
    return !obj1.contains(obj2);
  } else {
    return !!(obj1.compareDocumentPosition(obj2) - 20) && a != b;
  }
}

function toggleClassTimeOut(obj, classArry, timeout) {
  //添加class;
  obj.classList.add(classArry[1]);
  obj.classList.remove(classArry[0]);
  //移除class;
  setTimeout(() => {
    obj.classList.remove(classArry[1]);
  }, timeout);
}

function setClassAnimation(obj, classArry, timeout, display = true) {
  let vis = "visible";
  if (!display) {
    vis = "hidden";
  }
  obj.classList.add(classArry[0]);
  obj.style.visibility = vis;
  toggleClassTimeOut(obj, classArry, timeout);
}

//元素css动画
let styleAnimateTimer = undefined;
function styleAnimate(obj, classArry, n = 20, t = 20) {
  clearInterval(styleAnimateTimer);
  let runObj = undefined;
  let index = 0;

  if (Object.prototype.toString.apply(obj) == "[object HTMLCollection]") {
    runObj = Array.prototype.slice.call(obj);
    shuffleArray(runObj);
  } else {
    runObj = [obj];
  }

  styleAnimateTimer = setInterval(() => {
    // ---- timeOut ----
    if (index == runObj.length) {
      clearInterval(styleAnimateTimer);
    } else {
      //设置样式
      let thisObj = runObj[index];
      toggleClassTimeOut(thisObj, classArry, t);
      index += 1;
    }
    // ---- timeOut ----
  }, n);
}

//取元素绝对位置
const getAbsPos = {
  top(e) {
    if (e == undefined) return e;
    var offset = e.offsetTop;
    if (e.offsetParent != null) offset += this.top(e.offsetParent);
    return offset;
  },
  left(e) {
    if (e == undefined) return e;
    var offset = e.offsetLeft;

    if (e.offsetParent != null) offset += this.left(e.offsetParent);
    return offset;
  },
};

//字符串是否为数字
function getStrType(str) {
  if (!isNaN(parseFloat(str)) && isFinite(str)) return "NUM";
  if (str.toLowerCase() == "no" || str.toLowerCase() == "yes") return "YES";
  if (str.toLowerCase() == "true" || str.toLowerCase() == "false")
    return "BOOLE";
}

//首字母大写
function toUpperFirst(str) {
  return str[0].toUpperCase() + str.substr(1);
}
