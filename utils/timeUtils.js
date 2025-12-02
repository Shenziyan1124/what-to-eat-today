// 时间工具函数

/**
 * 获取当前用餐时段
 * @returns {Object} { key: 时段key, name: 时段名称 }
 */
export const getMealPeriod = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    return { key: "breakfast", name: "早餐时间" };
  } else if (hour >= 10 && hour <= 17) {
    return { key: "lunch", name: "午餐时间" };
  } else if (hour >= 17 && hour < 21) {
    return { key: "dinner", name: "晚餐时间" };
  } else {
    return { key: "supper", name: "夜宵时间" };
  }
};

/**
 * 从列表中随机获取一个美食(排除指定项)
 * @param {Array} foodList - 美食列表
 * @param {Array} excludeList - 排除列表
 * @returns {String|null} 随机美食名称
 */
export const getRandomFood = (foodList, excludeList = []) => {
  // 过滤掉排除项
  const availableFoods = foodList.filter((food) => !excludeList.includes(food));

  if (availableFoods.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableFoods.length);
  return availableFoods[randomIndex];
};

/**
 * 格式化当前时间
 * @returns {String} HH:MM格式的时间
 */
export const formatCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
