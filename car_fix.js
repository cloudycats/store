// replace_vip.js
let body = $response.body;
try {
  let obj = JSON.parse(body);
  if (obj && obj.data && obj.data.user) {
    obj.data.user.vip = 3;
    // 可选：也可设置 vip_start_date/vip_end_date
    obj.data.user.vip_start_date = "2026-02-11 00:00:00";
    obj.data.user.vip_end_date = "2099-12-31 23:59:59";
    body = JSON.stringify(obj);
  }
} catch (e) {}
$done({body});
