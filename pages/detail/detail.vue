<template>
  <view class="detail-page">
    <!-- 图片轮播 -->
    <swiper
      class="image-swiper"
      :indicator-dots="true"
      :autoplay="false"
      :circular="true"
      indicator-color="rgba(255,255,255,0.5)"
      indicator-active-color="#fff"
    >
      <swiper-item v-for="(photo, index) in restaurant.photos" :key="index">
        <image class="swiper-image" :src="photo.url" mode="aspectFill"></image>
      </swiper-item>
      <swiper-item v-if="!restaurant.photos || restaurant.photos.length === 0">
        <image
          class="swiper-image"
          src="/static/images/placeholder.png"
          mode="aspectFill"
        ></image>
      </swiper-item>
    </swiper>

    <!-- 基本信息卡片 -->
    <view class="info-card">
      <view class="restaurant-header">
        <text class="restaurant-name">{{ restaurant.name }}</text>
        <view class="rating-row" v-if="restaurant.rating">
          <text class="rating-star">⭐</text>
          <text class="rating-value">{{ restaurant.rating }}</text>
          <text class="rating-text">分</text>
        </view>
      </view>

      <view class="info-row" v-if="restaurant.cost">
        <text class="info-icon">💰</text>
        <text class="info-text">人均 ¥{{ restaurant.cost }}</text>
      </view>

      <view class="info-row" v-if="restaurant.opentime">
        <view
          class="status-badge"
          :class="getStatusClass(restaurant.businessStatus)"
        >
          {{ restaurant.businessStatus }}
        </view>
        <text class="info-text">{{ restaurant.opentime }}</text>
      </view>

      <view class="info-row" v-if="restaurant.type">
        <text class="info-icon">🍴</text>
        <text class="info-text">{{ restaurant.type }}</text>
      </view>
    </view>

    <!-- 地址信息卡片 -->
    <view class="info-card">
      <view class="card-title">
        <text class="title-icon">📍</text>
        <text class="title-text">地址信息</text>
      </view>
      <view class="address-content">
        <text class="address-text">{{ restaurant.address }}</text>
        <view class="distance-row" v-if="restaurant.distance">
          <text class="distance-text">距离您 {{ restaurant.distance }}m</text>
        </view>
      </view>
    </view>

    <!-- 联系方式卡片 -->
    <view class="info-card" v-if="restaurant.tel">
      <view class="card-title">
        <text class="title-icon">☎️</text>
        <text class="title-text">联系方式</text>
      </view>
      <view class="contact-content">
        <text class="phone-text">{{ restaurant.tel }}</text>
        <button class="call-btn" @click="makeCall">拨打</button>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="action-btn phone-btn" @click="makeCall">
        <text class="btn-icon">📞</text>
        <text>电话</text>
      </button>
      <button class="action-btn nav-btn" @click="openNavigation">
        <text class="btn-icon">🧭</text>
        <text>导航</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      restaurant: {
        id: "",
        name: "",
        type: "",
        address: "",
        location: "",
        tel: "",
        distance: "",
        rating: "",
        cost: "",
        opentime: "",
        businessStatus: "",
        photos: [],
      },
    };
  },
  onLoad(options) {
    if (options.data) {
      try {
        this.restaurant = JSON.parse(decodeURIComponent(options.data));
      } catch (error) {
        console.error("解析餐厅数据失败:", error);
        uni.showToast({
          title: "数据加载失败",
          icon: "none",
        });
      }
    }
  },
  methods: {
    getStatusClass(status) {
      if (!status) return "status-unknown";
      if (status.includes("营业中")) return "status-open";
      if (status.includes("即将打烊")) return "status-closing";
      return "status-closed";
    },
    makeCall() {
      if (!this.restaurant.tel) {
        uni.showToast({
          title: "暂无联系电话",
          icon: "none",
        });
        return;
      }

      uni.showModal({
        title: "拨打电话",
        content: this.restaurant.tel,
        confirmText: "拨打",
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: this.restaurant.tel,
              fail: () => {
                uni.showToast({
                  title: "拨打失败",
                  icon: "none",
                });
              },
            });
          }
        },
      });
    },
    openNavigation() {
      if (!this.restaurant.location) {
        uni.showToast({
          title: "位置信息不完整",
          icon: "none",
        });
        return;
      }

      const [longitude, latitude] = this.restaurant.location.split(",");

      uni.openLocation({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        name: this.restaurant.name,
        address: this.restaurant.address,
        scale: 15,
        fail: () => {
          uni.showToast({
            title: "打开地图失败",
            icon: "none",
          });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.detail-page {
  background: #f7f9fc;
  padding-bottom: 140rpx;
  height: calc(100vh - 146rpx);
}

.image-swiper {
  width: 100%;
  height: 400rpx;
  background: #f0f0f0;

  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

.info-card {
  margin: 24rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.restaurant-header {
  margin-bottom: 24rpx;

  .restaurant-name {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 16rpx;
  }

  .rating-row {
    display: flex;
    align-items: center;

    .rating-star {
      font-size: 32rpx;
      margin-right: 8rpx;
    }

    .rating-value {
      font-size: 32rpx;
      font-weight: 600;
      color: #ff6b35;
      margin-right: 4rpx;
    }

    .rating-text {
      font-size: 28rpx;
      color: #7f8c8d;
    }
  }
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .info-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .info-text {
    font-size: 28rpx;
    color: #2c3e50;
    flex: 1;
  }

  .status-badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    margin-right: 12rpx;

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

    &.status-unknown {
      background: #e8ecf1;
      color: #7f8c8d;
    }
  }
}

.card-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #e8ecf1;

  .title-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }

  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #2c3e50;
  }
}

.address-content {
  .address-text {
    display: block;
    font-size: 28rpx;
    color: #2c3e50;
    line-height: 1.6;
    margin-bottom: 16rpx;
  }

  .distance-row {
    .distance-text {
      font-size: 26rpx;
      color: #ff6b35;
      font-weight: 500;
    }
  }
}

.contact-content {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .phone-text {
    font-size: 32rpx;
    color: #2c3e50;
    font-weight: 500;
  }

  .call-btn {
    padding: 12rpx 32rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 24rpx;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  gap: 24rpx;

  .action-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.95);
    }

    .btn-icon {
      font-size: 36rpx;
      margin-right: 8rpx;
    }
  }

  .phone-btn {
    background: #fff;
    color: #2ecc71;
    border: 2rpx solid #2ecc71;
  }

  .nav-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
}
</style>
