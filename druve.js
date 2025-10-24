let body = JSON.parse($response.body);
// 修改 VIP 类型为 1，到期时间为 2027 年 12 月 31 日（ISO 格式，与原数据时间格式一致）
body.data.vipType = 1;
body.data.vipExpireTime = "2027-12-31 23:59:59";
$done({ body: JSON.stringify(body) });
