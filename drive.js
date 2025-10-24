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
      obj.data.vipExpireTime = "2027-12-31T23:59:59.000+00:00";
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
})();
