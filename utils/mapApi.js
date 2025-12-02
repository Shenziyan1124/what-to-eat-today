// 高德地图API工具函数

const AMAP_KEY = "92e3071a5d511723ee6b48756ae633f4";
const API_BASE_URL = "https://restapi.amap.com";

/**
 * 地址缓存管理
 */
const addressCache = {
  cache: {},
  // 生成缓存key
  getKey(lng, lat) {
    return `${lng.toFixed(4)},${lat.toFixed(4)}`;
  },
  // 获取缓存
  get(lng, lat) {
    const key = this.getKey(lng, lat);
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < 3600000) {
      // 1小时内有效
      return cached.data;
    }
    return null;
  },
  // 设置缓存
  set(lng, lat, data) {
    const key = this.getKey(lng, lat);
    this.cache[key] = {
      data: data,
      timestamp: Date.now(),
    };
  },
};

/**
 * 获取用户当前位置
 * @returns {Promise<Object>} 位置信息
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: "gcj02",
      success: (res) => {
        resolve({
          longitude: res.longitude,
          latitude: res.latitude,
        });
      },
      fail: (err) => {
        console.error("获取位置失败:", err);
        reject(err);
      },
    });
  });
};

/**
 * 逆地理编码 - 将坐标转换为地址
 * @param {Number} longitude - 经度
 * @param {Number} latitude - 纬度
 * @returns {Promise<Object>} 地址信息
 */
export const getAddressFromLocation = (longitude, latitude) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}/v3/geocode/regeo`,
      data: {
        key: AMAP_KEY,
        location: `${longitude},${latitude}`,
        extensions: "all",
        output: "json",
      },
      success: (res) => {
        if (res.data.status === "1" && res.data.regeocode) {
          const regeocode = res.data.regeocode;
          const addressComponent = regeocode.addressComponent;

          resolve({
            success: true,
            data: {
              formattedAddress: regeocode.formatted_address,
              province: addressComponent.province,
              city: addressComponent.city || addressComponent.province,
              district: addressComponent.district,
              township: addressComponent.township,
              towncode: addressComponent.towncode,
              neighborhood: addressComponent.neighborhood?.name || "",
              building: addressComponent.building?.name || "",
              streetNumber: addressComponent.streetNumber
                ? `${addressComponent.streetNumber.street}${addressComponent.streetNumber.number}`
                : "",
              shortAddress: `${addressComponent.district}${addressComponent.township}`,
            },
          });
        } else {
          reject({ success: false, error: res.data.info || "地址解析失败" });
        }
      },
      fail: (err) => {
        console.error("逆地理编码失败:", err);
        reject({ success: false, error: "网络请求失败" });
      },
    });
  });
};

/**
 * 获取当前位置的详细地址信息(带缓存)
 * @returns {Promise<Object>} 地址信息
 */
export const getCurrentAddress = async () => {
  try {
    // 1. 获取当前位置坐标
    const location = await getUserLocation();
    const { longitude, latitude } = location;

    // 2. 检查缓存
    const cached = addressCache.get(longitude, latitude);
    if (cached) {
      console.log("使用缓存的地址信息");
      return { success: true, ...cached, fromCache: true, longitude, latitude };
    }

    // 3. 调用逆地理编码API
    const result = await getAddressFromLocation(longitude, latitude);

    if (result.success) {
      // 4. 缓存结果
      addressCache.set(longitude, latitude, result.data);
      return {
        success: true,
        ...result.data,
        fromCache: false,
        longitude,
        latitude,
      };
    }

    return result;
  } catch (error) {
    console.error("获取当前地址失败:", error);
    return {
      success: false,
      error: error.errMsg || error.error || "定位失败",
    };
  }
};

/**
 * 格式化地址显示
 * @param {Object} addressData - 地址数据
 * @param {String} type - 格式类型 full/short/medium/province-city
 * @returns {String} 格式化后的地址
 */
export const formatAddress = (addressData, type = "full") => {
  if (!addressData) return "未知位置";

  switch (type) {
    case "full":
      return addressData.formattedAddress;
    case "short":
      return addressData.shortAddress;
    case "medium":
      return `${addressData.district}${addressData.township}${
        addressData.building || ""
      }`;
    case "province-city":
      return `${addressData.province}${addressData.district}`;
    default:
      return addressData.formattedAddress;
  }
};

/**
 * 获取附近餐厅
 * @param {Number} longitude - 经度
 * @param {Number} latitude - 纬度
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 餐厅列表
 */
export const getNearbyRestaurants = (longitude, latitude, options = {}) => {
  const {
    keywords = "美食",
    types = "050000",
    radius = 5000,
    sortrule = "distance",
    page_size = 20,
    page_num = 1,
    show_fields = "business,photos",
  } = options;

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}/v5/place/around`,
      data: {
        key: AMAP_KEY,
        location: `${longitude},${latitude}`,
        keywords,
        types,
        radius,
        sortrule,
        page_size,
        page_num,
        show_fields,
      },
      success: (res) => {
        if (res.data.status === "1") {
          const pois = res.data.pois || [];
          const restaurants = pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            type: poi.type,
            address: poi.address,
            location: poi.location,
            tel: poi.tel,
            distance: poi.distance,
            pname: poi.pname,
            cityname: poi.cityname,
            adname: poi.adname,
            rating: poi.business?.rating || "",
            cost: poi.business?.cost || "",
            opentime: poi.business?.opentime_today || "",
            photos: poi.photos || [],
            businessStatus: getBusinessStatus(poi.business?.opentime_today),
          }));

          resolve({
            success: true,
            data: restaurants,
            count: res.data.count,
          });
        } else {
          reject({ success: false, error: res.data.info || "查询失败" });
        }
      },
      fail: (err) => {
        console.error("获取附近餐厅失败:", err);
        reject({ success: false, error: "网络请求失败" });
      },
    });
  });
};

/**
 * 判断营业状态
 * @param {String} opentime - 营业时间字符串
 * @returns {String} 营业状态
 */
const getBusinessStatus = (opentime) => {
  if (!opentime) return "营业时间未知";

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // 解析营业时间 例如: "10:00-22:00"
  const timeMatch = opentime.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const openHour = parseInt(timeMatch[1]);
    const openMinute = parseInt(timeMatch[2]);
    const closeHour = parseInt(timeMatch[3]);
    const closeMinute = parseInt(timeMatch[4]);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    if (currentTime >= openTime && currentTime < closeTime) {
      // 即将打烊(关门前1小时)
      if (currentTime >= closeTime - 60) {
        return "即将打烊";
      }
      return "营业中";
    } else {
      return "已打烊";
    }
  }

  return "营业时间未知";
};

/**
 * 计算两点之间的距离
 * @param {Number} lat1 - 纬度1
 * @param {Number} lng1 - 经度1
 * @param {Number} lat2 - 纬度2
 * @param {Number} lng2 - 经度2
 * @returns {Number} 距离(米)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const radLat1 = (lat1 * Math.PI) / 180.0;
  const radLat2 = (lat2 * Math.PI) / 180.0;
  const a = radLat1 - radLat2;
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
  s = s * 6378137.0; // 地球半径(米)
  s = Math.round(s * 10000) / 10000;
  return Math.round(s);
};
