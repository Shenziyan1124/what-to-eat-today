<template>
  <view class="page-container">
    <!-- 自定义导航栏 + 时段卡片 -->
    <view class="time-header" :style="{ background: currentGradient }">
      <view
        class="status-bar"
        :style="{ height: statusBarHeight + 'px' }"
      ></view>
      <view class="navbar">
        <text class="navbar-title">今天吃什么</text>
      </view>
      <view class="time-badge">
        <text class="time-icon">🕐</text>
        <text class="time-text">{{ mealPeriod.name }}</text>
        <text class="time-value">{{ currentTime }}</text>
      </view>
      <text class="greeting">{{ greeting }}</text>
    </view>

    <!-- 推荐卡片 -->
    <view class="food-card-wrapper">
      <view class="food-card">
        <view class="food-emoji">{{ getFoodEmoji() }}</view>
        <view class="food-name">{{ currentFood }}</view>
        <view class="button-group">
          <button class="btn-primary" @click="changeFood">
            <text class="btn-icon">🔄</text>
            <text>换一换</text>
          </button>
          <button class="btn-outline" @click="dislikeFood">
            <text class="btn-icon">✖️</text>
            <text>不想吃</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section" v-if="historyList.length > 0">
      <view class="section-title">最近推荐</view>
      <view class="history-list">
        <view
          v-for="(item, index) in historyList"
          :key="index"
          class="history-tag"
          @click="selectHistory(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getMealPeriod,
  getRandomFood,
  formatCurrentTime,
} from "@/utils/timeUtils";
import { foodLists } from "@/utils/foodData";

export default {
  data() {
    return {
      statusBarHeight: 0,
      mealPeriod: { key: "breakfast", name: "早餐时间" },
      currentTime: "",
      currentFood: "",
      historyList: [],
      excludeList: [],
      timeInterval: null,
    };
  },
  computed: {
    currentGradient() {
      const gradients = {
        breakfast: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
        lunch: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        dinner: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        supper: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      };
      return gradients[this.mealPeriod.key];
    },
    greeting() {
      const greetings = {
        breakfast: "美好的一天从早餐开始 🌅",
        lunch: "午餐时间，补充能量 🍱",
        dinner: "享受美味晚餐时光 🌃",
        supper: "夜宵时刻，犒劳自己 🌙",
      };
      return greetings[this.mealPeriod.key];
    },
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;

    // 更新时段
    this.mealPeriod = getMealPeriod();

    // 更新时间
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 60000);

    // 推荐第一个美食
    this.changeFood();
  },
  onUnload() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  methods: {
    updateTime() {
      this.currentTime = formatCurrentTime();
      // 检查时段是否改变
      const newPeriod = getMealPeriod();
      if (newPeriod.key !== this.mealPeriod.key) {
        this.mealPeriod = newPeriod;
        this.excludeList = []; // 时段改变时清空排除列表
      }
    },
    changeFood() {
      uni.vibrateShort({
        fail: () => {},
      });

      const foodList = foodLists[this.mealPeriod.key];
      const newFood = getRandomFood(foodList, this.excludeList);

      if (newFood) {
        this.currentFood = newFood;
        this.addToHistory(newFood);
      } else {
        uni.showToast({
          title: "所有选项都被排除了",
          icon: "none",
        });
        this.excludeList = []; // 清空排除列表
      }
    },
    dislikeFood() {
      if (!this.currentFood) return;

      if (!this.excludeList.includes(this.currentFood)) {
        this.excludeList.push(this.currentFood);
        uni.showToast({
          title: `已排除 ${this.currentFood}`,
          icon: "none",
          duration: 1500,
        });
        this.changeFood();
      }
    },
    selectHistory(food) {
      this.currentFood = food;
      uni.vibrateShort({
        fail: () => {},
      });
    },
    addToHistory(food) {
      if (!this.historyList.includes(food)) {
        this.historyList.unshift(food);
        if (this.historyList.length > 10) {
          this.historyList.pop();
        }
      }
    },
    getFoodEmoji() {
      const emojis = [
        "🍜",
        "🍱",
        "🍝",
        "🍔",
        "🍕",
        "🍗",
        "🍤",
        "🍣",
        "🥘",
        "🍲",
      ];
      return emojis[Math.floor(Math.random() * emojis.length)];
    },
  },
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f7f9fc;
}

.time-header {
  padding-bottom: 32rpx;
  border-radius: 0 0 32rpx 32rpx;
  margin-bottom: 32rpx;

  .status-bar {
    width: 100%;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    padding: 0 32rpx;

    .navbar-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #fff;
    }
  }

  .time-badge {
    margin: 0 32rpx;
    display: inline-flex;
    align-items: center;
    padding: 12rpx 24rpx;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 40rpx;

    .time-icon {
      font-size: 32rpx;
    }

    .time-text {
      margin-left: 8rpx;
      color: #fff;
      font-size: 28rpx;
      font-weight: 600;
    }

    .time-value {
      margin-left: 16rpx;
      color: #fff;
      font-size: 24rpx;
      opacity: 0.9;
    }
  }

  .greeting {
    display: block;
    margin: 16rpx 32rpx 0;
    color: #fff;
    font-size: 24rpx;
    opacity: 0.9;
  }
}

.food-card-wrapper {
  padding: 0 48rpx;
}

.food-card {
  padding: 80rpx 48rpx 48rpx;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;

  .food-emoji {
    font-size: 120rpx;
    margin-bottom: 32rpx;
    animation: float 3s ease-in-out infinite;
  }

  .food-name {
    font-size: 96rpx;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 48rpx;
    min-height: 96rpx;
  }

  .button-group {
    display: flex;
    gap: 24rpx;

    button {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      border: none;
      transition: opacity 0.2s;

      &:active {
        opacity: 0.8;
      }

      .btn-icon {
        margin-right: 8rpx;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    }

    .btn-outline {
      background: transparent;
      color: #e74c3c;
      border: 2rpx solid #e74c3c;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

.history-section {
  margin-top: 48rpx;
  padding: 0 32rpx 0rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 24rpx;
  }

  .history-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .history-tag {
      padding: 12rpx 24rpx;
      background: #fff;
      border: 2rpx solid #e8ecf1;
      border-radius: 40rpx;
      font-size: 28rpx;
      color: #2c3e50;
      transition: all 0.3s;

      &:active {
        background: #f7f9fc;
        border-color: #667eea;
        color: #667eea;
        opacity: 0.8;
      }
    }
  }
}
</style>
