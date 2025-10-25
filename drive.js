// qx_getUserInfo.js
(function () {
  try {
    let body = $response.body;
    if (!body) {
      $done({});
      return;
    }
    let obj = JSON.parse(body);
    if (obj && obj.data) {
      obj.data.vipType = 1;
      obj.data.vipExpireTime = "林北终身会员!!";
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
