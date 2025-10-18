(function () {
  "use strict";
  
  // VIP时间配置常量
  const VIP_TIMES = {
    STANDARD_END: "2026-10-17 08:01:11",
    EXTENDED_END: "2027-10-17 08:01:11",
    DVIP_END: "2026-10-17 11:40:25",
    BEGIN_TIME: "2025-10-17 08:01:11",
    SVIP_BEGIN: "2026-05-26 00:10:03",
    SERVER_TIME: "2025-10-17 08:24:55",
    TIMESTAMP: 1760659981
  };
  
  // VIP状态常量
  const VIP_STATUS = {
    IS_VIP: 1,
    IS_PAID_VIP: 1,
    VIP_TYPE_1: 1,
    VIP_TYPE_2: 2,
    VIP_TYPE_3: 3,
    Y_TYPE_1: 1,
    Y_TYPE_2: 2,
    M_TYPE_1: 1,
    M_TYPE_3: 3,
    SVIP_LEVEL: 4,
    AUTO_VIP_TYPE: 1,
    MID_REPEAT: 1
  };
  
  // 获取请求URL
  const requestUrl = $request.url;
  let responseBody;
  
  try {
    // 解析响应体
    const responseData = JSON.parse($response.body);
    
    // 根据不同的URL路径调用不同的处理函数
    if (requestUrl.includes("/kugouvip/v2/batch_union_vipinfo")) {
      responseBody = JSON.stringify(modifyBatchUnionVipInfoV2(responseData));
    } else if (requestUrl.includes("/kugouvip/v1/batch_union_vipinfo")) {
      responseBody = JSON.stringify(modifyBatchUnionVipInfoV1(responseData));
    } else if (requestUrl.includes("/mobile/vipinfo")) {
      responseBody = JSON.stringify(modifyMobileVipInfo(responseData));
    } else if (requestUrl.includes("/v1/get_union_vip") || requestUrl.includes("/v1/vipuser_sub")) {
      responseBody = JSON.stringify(modifyUnionVip(responseData));
    } else if (requestUrl.includes("/v1/get_res_privilege")) {
      responseBody = JSON.stringify(modifyResPrivilege(responseData));
    } else if (requestUrl.includes("/kugouvip/v1/vipuser_sub")) {
      responseBody = JSON.stringify(modifyVipUserSub(responseData));
    } else {
      responseBody = $response.body;
    }
  } catch (error) {
    console.log("酷狗VIP修改脚本错误: " + error);
    responseBody = $response.body;
  }
  
  $done({
    "body": responseBody
  });
  
  // 修改批量联合VIP信息 V2版本
  function modifyBatchUnionVipInfoV2(data) {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    if (!modifiedData.data || !modifiedData.data.busi_vip || !modifiedData.data.main_vip) {
      return modifiedData;
    }
    
    // 修改业务VIP信息
    for (const key in modifiedData.data.busi_vip) {
      const vipArray = modifiedData.data.busi_vip[key];
      
      if (Array.isArray(vipArray)) {
        vipArray.forEach(vipItem => {
          switch (vipItem.product_type) {
            case "dvip": // 豪华VIP
              vipItem.vip_end_time = VIP_TIMES.DVIP_END;
              vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
              vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
              break;
            case "qvip": // 其他VIP
              vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
              vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
              break;
            case "svip": // 超级VIP
              vipItem.vip_end_time = VIP_TIMES.STANDARD_END;
              vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
              vipItem.is_vip = VIP_STATUS.IS_VIP;
              vipItem.y_type = VIP_STATUS.Y_TYPE_1;
              vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
              break;
            case "tvip": // 听书VIP
              vipItem.vip_end_time = VIP_TIMES.EXTENDED_END;
              vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
              vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
              break;
          }
        });
      }
    }
    
    // 修改主VIP信息
    for (const key in modifiedData.data.main_vip) {
      const mainVip = modifiedData.data.main_vip[key];
      
      if (mainVip && typeof mainVip === "object") {
        mainVip.vip_y_endtime = VIP_TIMES.STANDARD_END;
        mainVip.vip_end_time = VIP_TIMES.STANDARD_END;
        mainVip.su_vip_end_time = VIP_TIMES.STANDARD_END;
        mainVip.is_vip = VIP_STATUS.IS_VIP;
        mainVip.listen_end_time = VIP_TIMES.STANDARD_END;
        mainVip.dual_su_vip_end_time = VIP_TIMES.STANDARD_END;
        mainVip.vip_type = VIP_STATUS.VIP_TYPE_3;
        mainVip.su_vip_y_endtime = VIP_TIMES.STANDARD_END;
      }
    }
    
    return modifiedData;
  }
  
  // 修改批量联合VIP信息 V1版本
  function modifyBatchUnionVipInfoV1(data) {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    if (!modifiedData.data) {
      return modifiedData;
    }
    
    // 处理业务VIP列表
    if (modifiedData.data.busi_vip_list && Array.isArray(modifiedData.data.busi_vip_list)) {
      let hasSuperSuperVip = false;
      let userId = null;
      
      // 获取用户ID
      if (modifiedData.data.busi_vip_list.length > 0) {
        userId = modifiedData.data.busi_vip_list[0].userid;
      } else if (modifiedData.data.main_vip_list && modifiedData.data.main_vip_list.length > 0) {
        userId = modifiedData.data.main_vip_list[0].userid;
      }
      
      // 修改现有VIP信息
      modifiedData.data.busi_vip_list.forEach(vipItem => {
        if (vipItem.product_type === "svip") {
          vipItem.vip_end_time = VIP_TIMES.STANDARD_END;
          vipItem.vip_begin_time = VIP_TIMES.SVIP_BEGIN;
          vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
          vipItem.is_vip = VIP_STATUS.IS_VIP;
          vipItem.y_type = VIP_STATUS.Y_TYPE_2;
          vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
        }
        
        if (vipItem.product_type === "ssvip") {
          hasSuperSuperVip = true;
          vipItem.vip_end_time = VIP_TIMES.STANDARD_END;
          vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
          vipItem.is_vip = VIP_STATUS.IS_VIP;
          vipItem.y_type = VIP_STATUS.Y_TYPE_1;
          vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
        }
      });
      
      // 如果没有超级超级VIP，添加一个
      if (!hasSuperSuperVip && userId) {
        modifiedData.data.busi_vip_list.push({
          "latest_product_id": "",
          "purchased_ios_type": 0,
          "vip_end_time": VIP_TIMES.STANDARD_END,
          "vip_clearday": "",
          "vip_begin_time": VIP_TIMES.BEGIN_TIME,
          "vip_limit_quota": {
            "total": 600
          },
          "userid": userId,
          "paid_vip_expire_time": VIP_TIMES.STANDARD_END,
          "busi_type": "concept",
          "purchased_type": 0,
          "product_type": "ssvip",
          "is_vip": VIP_STATUS.IS_VIP,
          "y_type": VIP_STATUS.Y_TYPE_1,
          "is_paid_vip": VIP_STATUS.IS_PAID_VIP
        });
      }
    }
    
    // 处理主VIP列表
    if (modifiedData.data.main_vip_list && Array.isArray(modifiedData.data.main_vip_list)) {
      modifiedData.data.main_vip_list.forEach(mainVip => {
        mainVip.su_vip_y_endtime = VIP_TIMES.STANDARD_END;
        mainVip.vip_type = VIP_STATUS.VIP_TYPE_3;
        mainVip.m_y_endtime = VIP_TIMES.STANDARD_END;
        mainVip.vip_end_time = VIP_TIMES.STANDARD_END;
        mainVip.m_end_time = VIP_TIMES.STANDARD_END;
        mainVip.user_y_type = VIP_STATUS.Y_TYPE_2;
        mainVip.m_type = VIP_STATUS.M_TYPE_1;
        mainVip.y_type = VIP_STATUS.Y_TYPE_1;
        mainVip.is_vip = VIP_STATUS.IS_VIP;
        mainVip.user_type = VIP_STATUS.VIP_TYPE_2;
        mainVip.su_vip_end_time = VIP_TIMES.STANDARD_END;
        mainVip.vip_y_endtime = VIP_TIMES.STANDARD_END;
        mainVip.svip_level = VIP_STATUS.SVIP_LEVEL;
      });
    }
    
    if (modifiedData.data.time) {
      modifiedData.data.time = VIP_TIMES.TIMESTAMP;
    }
    
    return modifiedData;
  }
  
  // 修改移动端VIP信息
  function modifyMobileVipInfo(data) {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    if (!modifiedData.data || !modifiedData.error) {
      return modifiedData;
    }
    
    const vipData = modifiedData.data;
    vipData.vip_type = VIP_STATUS.VIP_TYPE_1;
    vipData.vip_y_endtime = VIP_TIMES.STANDARD_END;
    vipData.su_vip_y_endtime = VIP_TIMES.STANDARD_END;
    vipData.h_end_time = VIP_TIMES.STANDARD_END;
    vipData.vip_end_time = VIP_TIMES.STANDARD_END;
    vipData.roam_end_time = VIP_TIMES.STANDARD_END;
    vipData.m_y_endtime = VIP_TIMES.STANDARD_END;
    vipData.is_vip = VIP_STATUS.IS_VIP;
    vipData.h_begin_time = VIP_TIMES.STANDARD_END;
    vipData.su_vip_end_time = VIP_TIMES.STANDARD_END;
    vipData.m_end_time = VIP_TIMES.STANDARD_END;
    vipData.dual_su_vip_end_time = VIP_TIMES.STANDARD_END;
    vipData.autoVipType = VIP_STATUS.AUTO_VIP_TYPE;
    
    if (vipData.promise) {
      vipData.promise.end_time = VIP_TIMES.STANDARD_END;
    }
    
    const errorData = modifiedData.error;
    errorData.vip_type = VIP_STATUS.VIP_TYPE_2;
    errorData.vip_y_endtime = VIP_TIMES.STANDARD_END;
    errorData.su_vip_y_endtime = VIP_TIMES.STANDARD_END;
    errorData.h_end_time = VIP_TIMES.STANDARD_END;
    errorData.vip_end_time = VIP_TIMES.STANDARD_END;
    errorData.roam_end_time = VIP_TIMES.STANDARD_END;
    errorData.m_y_endtime = VIP_TIMES.STANDARD_END;
    errorData.is_vip = VIP_STATUS.IS_VIP;
    errorData.su_vip_end_time = VIP_TIMES.STANDARD_END;
    errorData.m_end_time = VIP_TIMES.STANDARD_END;
    errorData.dual_su_vip_end_time = VIP_TIMES.STANDARD_END;
    errorData.listen_end_time = VIP_TIMES.STANDARD_END;
    
    if (errorData.promise) {
      errorData.promise.end_time = VIP_TIMES.STANDARD_END;
    }
    
    if (vipData.servertime) {
      vipData.servertime = VIP_TIMES.SERVER_TIME;
    }
    
    if (errorData.servertime) {
      errorData.servertime = VIP_TIMES.SERVER_TIME;
    }
    
    return modifiedData;
  }
  
  // 修改联合VIP信息
  function modifyUnionVip(data) {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    if (!modifiedData.data) {
      return modifiedData;
    }
    
    const vipData = modifiedData.data;
    vipData.vip_type = VIP_STATUS.VIP_TYPE_2;
    vipData.m_y_endtime = VIP_TIMES.STANDARD_END;
    vipData.vip_end_time = VIP_TIMES.STANDARD_END;
    vipData.m_end_time = VIP_TIMES.STANDARD_END;
    vipData.is_vip = VIP_STATUS.IS_VIP;
    vipData.user_type = VIP_STATUS.VIP_TYPE_2;
    vipData.su_vip_end_time = VIP_TIMES.STANDARD_END;
    vipData.vip_y_endtime = VIP_TIMES.STANDARD_END;
    vipData.svip_level = VIP_STATUS.SVIP_LEVEL;
    
    if (vipData.busi_vip && Array.isArray(vipData.busi_vip)) {
      vipData.busi_vip.forEach(vipItem => {
        vipItem.vip_end_time = VIP_TIMES.STANDARD_END;
        vipItem.paid_vip_expire_time = VIP_TIMES.STANDARD_END;
        vipItem.is_paid_vip = VIP_STATUS.IS_PAID_VIP;
        vipItem.y_type = VIP_STATUS.Y_TYPE_1;
        
        switch (vipItem.product_type) {
          case "tvip":
            break;
          case "qvip":
            break;
          case "dvip":
            break;
          case "svip":
            vipItem.is_vip = VIP_STATUS.VIP_TYPE_2;
            break;
        }
      });
    }
    
    return modifiedData;
  }
  
  // 修改资源权限信息
  function modifyResPrivilege(data) {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    if (modifiedData.userinfo) {
      modifiedData.userinfo.m_type = VIP_STATUS.M_TYPE_3;
      modifiedData.userinfo.vip_type = VIP_STATUS.VIP_TYPE_3;
    }
    
    modifiedData.vip_user_type = VIP_STATUS.VIP_TYPE_3;
    
    return modifiedData;
  }
  
  // 修改VIP用户订阅信息
  function modifyVipUserSub(data) {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    if (modifiedData.data && modifiedData.data.hasOwnProperty("mid_repeat")) {
      modifiedData.data.mid_repeat = VIP_STATUS.MID_REPEAT;
    }
    
    return modifiedData;
  }
})();
