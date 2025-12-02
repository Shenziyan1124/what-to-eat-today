<template>
  <view class="nearby-page">
    <!-- 位置栏 -->
    <view class="location-bar" @click="showFullAddress">
      <view class="location-content">
        <text class="location-icon">📍</text>
        <view class="address-info">
          <text class="address-main">{{ currentAddress }}</text>
          <text class="address-tip">点击查看完整地址</text>
        </view>
      </view>
      <view class="refresh-btn" @click.stop="refreshLocation">
        <text class="refresh-icon" :class="{ rotating: isRefreshing }">🔄</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-btn"
        :class="{ active: sortType === 'distance' }"
        @click="changeSortType('distance')"
      >
        <text>距离</text>
        <text class="arrow">▼</text>
      </view>
      <view
        class="filter-btn"
        :class="{ active: sortType === 'weight' }"
        @click="changeSortType('weight')"
      >
        <text>综合排序</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-btn" @click="showFilterPopup">
        <text>筛选</text>
        <text class="icon">🎚️</text>
        <text v-if="hasActiveFilter" class="filter-dot"></text>
      </view>
    </view>

    <!-- 餐厅列表 -->
    <scroll-view
      v-if="!loading && filteredRestaurants.length > 0"
      scroll-y
      class="restaurant-list"
      @scrolltolower="loadMore"
    >
      <view
        v-for="item in filteredRestaurants"
        :key="item.id"
        class="restaurant-card"
        @click="goToDetail(item)"
      >
        <view class="restaurant-image-wrapper">
          <image
            class="restaurant-image"
            :src="getRestaurantImage(item)"
            mode="aspectFill"
          ></image>
        </view>
        <view class="restaurant-info">
          <text class="restaurant-name">{{ item.name }}</text>
          <view class="restaurant-tags">
            <view class="tag" v-if="item.rating">
              <text class="star">⭐</text>
              <text>{{ item.rating }}</text>
            </view>
            <view class="tag" v-if="item.cost">
              <text class="icon">💰</text>
              <text>¥{{ item.cost }}</text>
            </view>
            <view class="tag">
              <text class="icon">📍</text>
              <text>{{ item.distance }}m</text>
            </view>
          </view>
          <text class="restaurant-address">{{ item.address }}</text>
          <view
            class="status-badge"
            :class="getStatusClass(item.businessStatus)"
          >
            {{ item.businessStatus }}
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <text>{{ loadingMore ? "加载中..." : "上拉加载更多" }}</text>
      </view>
      <view class="load-more" v-else-if="filteredRestaurants.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-wrapper">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在搜索附近餐厅...</text>
    </view>

    <!-- 空状态 -->
    <view
      v-if="!loading && filteredRestaurants.length === 0"
      class="empty-wrapper"
    >
      <text class="empty-icon">🍽️</text>
      <text class="empty-text">{{
        restaurants.length > 0 ? "没有符合条件的餐厅" : "附近暂无餐厅"
      }}</text>
      <button class="retry-btn" @click="loadNearbyRestaurants">重新加载</button>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilter" class="filter-popup">
      <view class="popup-mask" @click="hideFilterPopup"></view>
      <view class="popup-content" :class="{ show: showFilter }">
        <!-- 头部 -->
        <view class="popup-header">
          <text class="popup-title">筛选</text>
          <view class="popup-actions">
            <text class="reset-btn" @click="resetFilter">重置</text>
            <text class="confirm-btn" @click="applyFilter">确定</text>
          </view>
        </view>

        <!-- 筛选项 -->
        <scroll-view scroll-y class="popup-body">
          <!-- 距离范围 -->
          <view class="filter-section">
            <view class="section-title">📍 距离范围</view>
            <view class="option-list">
              <view
                v-for="item in distanceOptions"
                :key="item.value"
                class="option-item"
                :class="{ active: tempFilters.distance === item.value }"
                @click="selectDistance(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
          </view>

          <!-- 餐厅类型 -->
          <view class="filter-section">
            <view class="section-title">🍽️ 餐厅类型</view>
            <view class="option-list">
              <view
                v-for="item in typeOptions"
                :key="item.value"
                class="option-item"
                :class="{ active: tempFilters.type === item.value }"
                @click="selectType(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
          </view>

          <!-- 价格区间 -->
          <view class="filter-section">
            <view class="section-title">💰 价格区间</view>
            <view class="option-list">
              <view
                v-for="item in priceOptions"
                :key="item.value"
                class="option-item"
                :class="{ active: tempFilters.price === item.value }"
                @click="selectPrice(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
          </view>

          <!-- 评分 -->
          <view class="filter-section">
            <view class="section-title">⭐ 评分</view>
            <view class="option-list">
              <view
                v-for="item in ratingOptions"
                :key="item.value"
                class="option-item"
                :class="{ active: tempFilters.rating === item.value }"
                @click="selectRating(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
          </view>

          <!-- 排序方式 -->
          <view class="filter-section">
            <view class="section-title">📊 排序方式</view>
            <view class="option-list">
              <view
                v-for="item in sortOptions"
                :key="item.value"
                class="option-item"
                :class="{ active: tempFilters.sort === item.value }"
                @click="selectSort(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getCurrentAddress,
  formatAddress,
  getNearbyRestaurants,
} from "@/utils/mapApi";

export default {
  data() {
    return {
      currentAddress: "正在定位...",
      fullAddress: "",
      currentLocation: null,
      isRefreshing: false,
      loading: true,
      loadingMore: false,
      restaurants: [],
      sortType: "distance",
      pageNum: 1,
      hasMore: true,

      // 筛选相关
      showFilter: false,
      filters: {
        distance: 5000, // 默认5km
        type: "", // 空表示全部
        sort: "distance",
        price: "", // 价格区间
        rating: "", // 评分
      },
      tempFilters: {
        distance: 5000,
        type: "",
        sort: "distance",
        price: "",
        rating: "",
      },

      // 筛选选项
      distanceOptions: [
        { label: "1公里内", value: 1000 },
        { label: "3公里内", value: 3000 },
        { label: "5公里内", value: 5000 },
      ],
      typeOptions: [
        { label: "全部", value: "" },
        { label: "中餐", value: "050100" },
        { label: "西餐", value: "050200" },
        { label: "火锅", value: "050500" },
        { label: "烧烤", value: "050800" },
        { label: "快餐", value: "050700" },
      ],
      sortOptions: [
        { label: "距离优先", value: "distance" },
        { label: "综合排序", value: "weight" },
      ],
      priceOptions: [
        { label: "不限", value: "" },
        { label: "实惠 ≤50", value: "0-50" },
        { label: "中档 50-100", value: "50-100" },
        { label: "高档 100-200", value: "100-200" },
        { label: "豪华 ≥200", value: "200-999999" },
      ],
      ratingOptions: [
        { label: "不限", value: "" },
        { label: "4.5分以上", value: "4.5" },
        { label: "4.0分以上", value: "4.0" },
        { label: "3.5分以上", value: "3.5" },
      ],
    };
  },
  computed: {
    hasActiveFilter() {
      return (
        this.filters.distance !== 5000 ||
        this.filters.type !== "" ||
        this.filters.price !== "" ||
        this.filters.rating !== ""
      );
    },
    // 前端筛选后的餐厅列表
    filteredRestaurants() {
      let result = [...this.restaurants];

      // 价格筛选
      if (this.filters.price) {
        const [min, max] = this.filters.price.split("-").map(Number);
        result = result.filter((item) => {
          if (!item.cost) return false;
          const cost = Number(item.cost);
          return cost >= min && cost <= max;
        });
      }

      // 评分筛选
      if (this.filters.rating) {
        const minRating = Number(this.filters.rating);
        result = result.filter((item) => {
          if (!item.rating) return false;
          return Number(item.rating) >= minRating;
        });
      }

      return result;
    },
  },
  onLoad() {
    this.init();
  },
  onPullDownRefresh() {
    this.refreshData();
  },
  methods: {
    async init() {
      await this.loadCurrentAddress();
      if (this.currentLocation) {
        await this.loadNearbyRestaurants();
      }
    },
    async loadCurrentAddress() {
      try {
        const result = await getCurrentAddress();
        if (result.success) {
          this.currentAddress = formatAddress(result, "short");
          this.fullAddress = formatAddress(result, "full");
          this.currentLocation = {
            longitude: result.longitude,
            latitude: result.latitude,
          };
        } else {
          this.currentAddress = "定位失败";
          uni.showModal({
            title: "定位失败",
            content: result.error || "无法获取您的位置信息",
            confirmText: "重试",
            success: (res) => {
              if (res.confirm) {
                this.loadCurrentAddress();
              }
            },
          });
        }
      } catch (error) {
        console.error("获取地址失败:", error);
        this.currentAddress = "定位失败";
      }
    },
    async loadNearbyRestaurants() {
      if (!this.currentLocation) {
        uni.showToast({
          title: "请先获取位置",
          icon: "none",
        });
        return;
      }

      this.loading = true;
      this.pageNum = 1;
      this.hasMore = true;

      try {
        const params = {
          sortrule: this.filters.sort,
          page_num: this.pageNum,
          page_size: 20,
          radius: this.filters.distance,
        };

        if (this.filters.type) {
          params.types = this.filters.type;
        }

        const result = await getNearbyRestaurants(
          this.currentLocation.longitude,
          this.currentLocation.latitude,
          params
        );

        if (result.success) {
          this.restaurants = result.data;
          this.hasMore = result.data.length >= 20;
        } else {
          uni.showToast({
            title: result.error || "获取餐厅列表失败",
            icon: "none",
          });
          this.restaurants = [];
        }
      } catch (error) {
        console.error("获取餐厅失败:", error);
        uni.showToast({
          title: "网络错误",
          icon: "none",
        });
        this.restaurants = [];
      } finally {
        this.loading = false;
      }
    },
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return;

      this.loadingMore = true;
      this.pageNum++;

      try {
        const params = {
          sortrule: this.filters.sort,
          page_num: this.pageNum,
          page_size: 20,
          radius: this.filters.distance,
        };

        if (this.filters.type) {
          params.types = this.filters.type;
        }

        const result = await getNearbyRestaurants(
          this.currentLocation.longitude,
          this.currentLocation.latitude,
          params
        );

        if (result.success && result.data.length > 0) {
          this.restaurants = [...this.restaurants, ...result.data];
          this.hasMore = result.data.length >= 20;
        } else {
          this.hasMore = false;
        }
      } catch (error) {
        console.error("加载更多失败:", error);
      } finally {
        this.loadingMore = false;
      }
    },
    async refreshLocation() {
      this.isRefreshing = true;
      uni.vibrateShort({ fail: () => {} });

      await this.loadCurrentAddress();
      if (this.currentLocation) {
        await this.loadNearbyRestaurants();
      }

      this.isRefreshing = false;
      uni.showToast({
        title: "位置已更新",
        icon: "success",
      });
    },
    async refreshData() {
      await this.loadNearbyRestaurants();
      uni.stopPullDownRefresh();
    },
    changeSortType(type) {
      if (this.filters.sort === type) return;
      this.filters.sort = type;
      this.tempFilters.sort = type;
      this.sortType = type;
      this.loadNearbyRestaurants();
    },

    // 筛选弹窗相关
    showFilterPopup() {
      this.tempFilters = { ...this.filters };
      this.showFilter = true;
    },
    hideFilterPopup() {
      this.showFilter = false;
    },
    selectDistance(value) {
      this.tempFilters.distance = value;
    },
    selectType(value) {
      this.tempFilters.type = value;
    },
    selectSort(value) {
      this.tempFilters.sort = value;
    },
    selectPrice(value) {
      this.tempFilters.price = value;
    },
    selectRating(value) {
      this.tempFilters.rating = value;
    },
    resetFilter() {
      this.tempFilters = {
        distance: 5000,
        type: "",
        sort: "distance",
        price: "",
        rating: "",
      };
    },
    applyFilter() {
      this.filters = { ...this.tempFilters };
      this.sortType = this.filters.sort;
      this.hideFilterPopup();
      this.loadNearbyRestaurants();

      uni.vibrateShort({ fail: () => {} });
    },

    showFullAddress() {
      if (this.fullAddress) {
        uni.showModal({
          title: "当前位置",
          content: this.fullAddress,
          showCancel: false,
          confirmText: "知道了",
        });
      }
    },
    getStatusClass(status) {
      if (status.includes("营业中")) return "status-open";
      if (status.includes("即将打烊")) return "status-closing";
      return "status-closed";
    },
    getRestaurantImage(item) {
      if (item.photos && item.photos.length > 0) {
        return item.photos[0].url;
      }
      return "/static/images/placeholder.png";
    },
    goToDetail(item) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${item.id}&data=${encodeURIComponent(
          JSON.stringify(item)
        )}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.nearby-page {
  min-height: 100vh;
  background: #f7f9fc;
}

.location-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  margin: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .location-content {
    display: flex;
    align-items: center;
    flex: 1;

    .location-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }

    .address-info {
      display: flex;
      flex-direction: column;
      flex: 1;

      .address-main {
        font-size: 28rpx;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4rpx;
      }

      .address-tip {
        font-size: 24rpx;
        color: #7f8c8d;
      }
    }
  }

  .refresh-btn {
    padding: 8rpx;

    .refresh-icon {
      font-size: 40rpx;
      display: inline-block;
      transition: transform 0.3s ease;

      &.rotating {
        animation: rotate 1s linear infinite;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;

  .filter-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx 32rpx;
    background: #f7f9fc;
    border-radius: 40rpx;
    font-size: 28rpx;
    color: #2c3e50;
    transition: all 0.3s;
    position: relative;

    .arrow,
    .icon {
      margin-left: 8rpx;
      font-size: 20rpx;
    }

    .filter-dot {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      width: 12rpx;
      height: 12rpx;
      background: #e74c3c;
      border-radius: 50%;
    }

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}

.restaurant-list {
  height: calc(100vh - 266rpx);
}

.restaurant-card {
  display: flex;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 0 20rpx 24rpx;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
  &:nth-child(1) {
    margin-top: 20rpx;
  }

  .restaurant-image-wrapper {
    width: 160rpx;
    height: 160rpx;
    margin-right: 24rpx;
    flex-shrink: 0;

    .restaurant-image {
      width: 100%;
      height: 100%;
      border-radius: 16rpx;
      background: #f0f0f0;
    }
  }

  .restaurant-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .restaurant-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .restaurant-tags {
      display: flex;
      gap: 16rpx;
      margin-bottom: 12rpx;

      .tag {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #7f8c8d;

        .star,
        .icon {
          margin-right: 4rpx;
        }

        .star {
          color: #ff6b35;
        }
      }
    }

    .restaurant-address {
      font-size: 24rpx;
      color: #7f8c8d;
      margin-bottom: 12rpx;
    }

    .status-badge {
      display: inline-block;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      align-self: flex-start;

      &.status-open {
        background: #d4edda;
        color: #155724;
      }

      &.status-closing {
        background: #fff3cd;
        color: #856404;
      }

      &.status-closed {
        background: #f8d7da;
        color: #721c24;
      }
    }
  }
}

.load-more {
  padding: 32rpx;
  text-align: center;
  font-size: 28rpx;
  color: #7f8c8d;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid #f3f3f3;
    border-top: 6rpx solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #7f8c8d;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #7f8c8d;
    margin-bottom: 48rpx;
  }

  .retry-btn {
    padding: 20rpx 48rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }
}

// 筛选弹窗样式
.filter-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.3s;
  }

  .popup-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 70vh;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #e8ecf1;

      .popup-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #2c3e50;
      }

      .popup-actions {
        display: flex;
        gap: 24rpx;

        .reset-btn,
        .confirm-btn {
          padding: 12rpx 24rpx;
          border-radius: 40rpx;
          font-size: 28rpx;
        }

        .reset-btn {
          color: #7f8c8d;
          background: #f7f9fc;
        }

        .confirm-btn {
          color: #fff;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      }
    }

    .popup-body {
      flex: 1;
      overflow-y: auto;
      box-sizing: border-box;

      .filter-section {
        padding: 0 32rpx;
        margin-bottom: 48rpx;

        &:first-child {
          padding-top: 24rpx;
        }

        &:last-child {
          padding-bottom: 24rpx;
        }

        .section-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 24rpx;
        }

        .option-list {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;

          .option-item {
            padding: 16rpx 32rpx;
            background: #f7f9fc;
            border-radius: 40rpx;
            border: 2rpx solid transparent;
            font-size: 28rpx;
            color: #2c3e50;
            transition: all 0.3s;

            &.active {
              background: rgba(102, 126, 234, 0.1);
              border-color: #667eea;
              color: #667eea;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
