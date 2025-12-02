# TabBar 图标设计指南

由于编辑器限制,无法直接创建图片文件。请按照以下方式准备图标:

## 方式一: 使用在线工具生成

### 推荐工具

- **Iconfont (阿里巴巴矢量图标库)**: https://www.iconfont.cn/
- **Flaticon**: https://www.flaticon.com/
- **IconMonstr**: https://iconmonstr.com/

### 图标规格

- 尺寸: 81x81 像素
- 格式: PNG (推荐) 或 JPG
- 背景: 透明背景

## 方式二: 使用 Emoji 截图

### 临时方案 (快速开发)

如果只是为了测试,可以使用纯色图标:

1. **tab-food.png** - 今天吃什么图标

   - Emoji: 🍜 或 🍱
   - 未选中颜色: #7F8C8D (灰色)

2. **tab-food-active.png** - 今天吃什么图标(选中)

   - Emoji: 🍜 或 🍱
   - 选中颜色: #FF6B35 (橙色)

3. **tab-nearby.png** - 附近餐厅图标

   - Emoji: 📍 或 🧭
   - 未选中颜色: #7F8C8D (灰色)

4. **tab-nearby-active.png** - 附近餐厅图标(选中)
   - Emoji: 📍 或 🧭
   - 选中颜色: #FF6B35 (橙色)

### 快速制作步骤:

1. 打开任意设计工具 (Photoshop/Figma/Canva)
2. 创建 81x81px 画布
3. 插入对应的 Emoji
4. 调整大小至合适尺寸
5. 导出为 PNG 格式

## 方式三: 使用图标字体

在项目中使用 iconfont 字体图标,无需图片文件:

```vue
<!-- 在 pages.json 中使用 iconfont -->
<template>
  <view class="tab-icon">
    <text class="iconfont icon-food"></text>
  </view>
</template>
```

## 方式四: 使用设计规范

### 今天吃什么图标设计要点:

- 主元素: 碗/筷子/餐具
- 风格: 简约线性图标
- 细节: 可以添加食物元素点缀

### 附近餐厅图标设计要点:

- 主元素: 定位标记/地图标识
- 风格: 清晰可辨的位置图标
- 细节: 可以结合餐厅建筑轮廓

## 临时解决方案

如果暂时没有图标,可以在 `pages.json` 中临时注释掉图标路径:

```json
{
  "tabBar": {
    "color": "#7F8C8D",
    "selectedColor": "#FF6B35",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "今天吃什么"
        // "iconPath": "static/images/tab-food.png",
        // "selectedIconPath": "static/images/tab-food-active.png"
      },
      {
        "pagePath": "pages/nearby/nearby",
        "text": "附近餐厅"
        // "iconPath": "static/images/tab-nearby.png",
        // "selectedIconPath": "static/images/tab-nearby-active.png"
      }
    ]
  }
}
```

这样 TabBar 仍然可以正常显示,只是没有图标,只显示文字。

## 占位图片

对于餐厅占位图 `placeholder.png`,可以:

1. 从 unsplash.com 下载免费的餐厅图片
2. 使用纯色背景 + "暂无图片" 文字
3. 使用简单的餐厅图标作为占位

推荐尺寸: 400x400 像素

---

完成图标准备后,将文件放到 `static/images/` 目录下即可。
