"use strict";

!function () {
  var e = document.currentScript,
      t = e.getAttribute("interval") || "2000",
      o = e.getAttribute("room") || "",
      n = e.getAttribute("api") || "http://localhost:8080/counter";
  localStorage.setItem("room", o);

  var r = function r() {
    var e = new XMLHttpRequest(),
        l = n;

    if ("" !== o) {
      l = "".concat(n, "?room=").concat(o);
    }

    e.open("GET", l, !0);
    var c = localStorage.getItem("token");

    if (null !== c) {
      e.setRequestHeader("Authorization", "Bearer " + c);
    }

    e.onload = function () {
      if (4 === e.readyState && 200 === e.status) {
        var n = JSON.parse(e.responseText);

        if (!0 === n.success) {
          var l = n.data;
          document.getElementById("online_user").innerHTML = l.online_user;
          document.getElementById("online_total").innerHTML = a(l.online_total);
          document.getElementById("online_me").innerHTML = a(l.online_me);
          var s = e.getResponseHeader("Set-Token");

          if (null == c && null != s && s.trim() !== "") {
            localStorage.setItem("token", s);
          }

          if (!o || o !== localStorage.getItem("room")) {
            setTimeout(r, parseInt(t));
          }
        } else {
          alert(n.message);
          console.error(n.message);
        }
      }
    };

    e.onerror = function () {
      console.error("An error occurred while making the request.");
    };

    e.send();
  };

  var a = function a(e) {
    var t = Math.floor(e / 86400),
        o = Math.floor(e % 86400 / 3600),
        n = Math.floor(e % 3600 / 60),
        r = Math.floor(e % 60);
    return "".concat(t, "d ").concat(o, "h ").concat(n, "m ").concat(r, "s");
  };

  r();
}();