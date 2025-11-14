// 示例数据生成器
import { v4 as uuidv4 } from 'uuid'

export const generateSampleData = () => {
  // 用户数据
  const users = [
    {
      id: uuidv4(),
      email: 'eco_warrior@greenlife.com',
      username: '环保战士',
      password: 'demo123',
      created_at: new Date(Date.now() - 604800000).toISOString()
    },
    {
      id: uuidv4(),
      email: 'green_living@greenlife.com',
      username: '绿色生活家',
      password: 'demo123',
      created_at: new Date(Date.now() - 2592000000).toISOString()
    },
    {
      id: uuidv4(),
      email: 'sustainable_energy@greenlife.com',
      username: '可持续能源爱好者',
      password: 'demo123',
      created_at: new Date(Date.now() - 5184000000).toISOString()
    }
  ]

  // 用户资料
  const profiles = [
    {
      id: users[0].id,
      username: '环保战士',
      avatar_url: '/images/avatars/avatar1.jpg',
      bio: '致力于推广环保理念，分享实用的环保技巧',
      eco_points: 356,
      created_at: users[0].created_at,
      updated_at: new Date().toISOString()
    },
    {
      id: users[1].id,
      username: '绿色生活家',
      avatar_url: '/images/avatars/avatar2.jpg',
      bio: '专注于绿色生活方式的实践和传播',
      eco_points: 521,
      created_at: users[1].created_at,
      updated_at: new Date().toISOString()
    },
    {
      id: users[2].id,
      username: '可持续能源爱好者',
      avatar_url: '/images/avatars/avatar3.jpg',
      bio: '研究和推广可持续能源技术的应用',
      eco_points: 287,
      created_at: users[2].created_at,
      updated_at: new Date().toISOString()
    }
  ]

  // 分类
  const categories = [
    {
      id: uuidv4(),
      name: '环保知识',
      description: '分享环保知识和技巧'
    },
    {
      id: uuidv4(),
      name: '绿色生活',
      description: '绿色生活方式和习惯'
    },
    {
      id: uuidv4(),
      name: '废物利用',
      description: '创意废物利用和回收'
    },
    {
      id: uuidv4(),
      name: '可持续能源',
      description: '可持续能源应用和讨论'
    },
    {
      id: uuidv4(),
      name: '生态保护',
      description: '生态系统保护和修复'
    }
  ]

  // 帖子数据
  const posts = [
    {
      id: uuidv4(),
      user_id: users[0].id,
      title: '如何在家中实现垃圾分类',
      content: `垃圾分类是环保的第一步，本文将详细介绍如何在家中有效实施垃圾分类：

## 1. 准备分类垃圾桶
- 厨房：湿垃圾（厨余垃圾）
- 客厅：干垃圾（其他垃圾）
- 书房：可回收物
- 门口：有害垃圾

## 2. 分类标准
- **可回收物**：纸类、塑料、玻璃、金属
- **有害垃圾**：电池、药品、灯管、化学品
- **湿垃圾**：食物残渣、果皮、茶叶
- **干垃圾**：不能归类的其他垃圾

## 3. 实用技巧
- 使用标签明确各垃圾桶用途
- 定期清理，避免异味
- 可回收物清洗干净后投放

通过正确分类，我们可以为环境保护贡献力量！`,
      image_url: '/images/posts/garbage-sorting.jpg',
      category_id: categories[0].id,
      like_count: 25,
      view_count: 156,
      comment_count: 8,
      is_published: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: users[1].id,
      title: '10个简单的节水技巧',
      content: `水资源宝贵，这里分享10个在日常生活中可以轻松实践的节水技巧：

## 节水技巧清单

### 1. 收集雨水
- 在阳台或花园放置水桶收集雨水
- 可用于浇花、冲洗等非饮用用途

### 2. 修复漏水
- 定期检查水龙头、马桶是否漏水
- 及时修复，避免水资源浪费

### 3. 合理使用洗衣机
- 集满衣物再洗
- 选择合适的水位和洗涤模式

### 4. 缩短淋浴时间
- 控制在5-8分钟以内
- 使用节水型淋浴头

### 5. 重复利用水资源
- 洗菜水可用于浇花
- 洗脸水可用于冲厕

### 6. 使用节水器具
- 安装节水型马桶、水龙头
- 投资长期节水设备

### 7. 收集空调冷凝水
- 夏季空调产生的冷凝水
- 可用于清洁等用途

### 8. 合理浇灌植物
- 选择早晚温度较低时浇灌
- 使用滴灌系统减少蒸发

### 9. 减少洗车次数
- 使用湿布擦拭代替水洗
- 选择无水洗车产品

### 10. 教育家人节水
- 培养全家人的节水意识
- 互相监督节水习惯

每个小习惯都能为节约水资源做出贡献！`,
      image_url: '/images/posts/water-saving.jpg',
      category_id: categories[1].id,
      like_count: 42,
      view_count: 234,
      comment_count: 15,
      is_published: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: users[2].id,
      title: '塑料瓶的创意再利用方法',
      content: `废弃塑料瓶不要扔，这里有多种创意再利用方法，让塑料瓶重获新生：

## 创意改造项目

### 1. 植物盆栽
- 剪开塑料瓶上半部分
- 底部打孔作为排水
- 种植小型植物或香草

### 2. 笔筒收纳
- 去除标签和瓶盖
- 可单个使用或组合粘贴
- 分类收纳文具用品

### 3. 装饰灯罩
- 剪成花瓣形状
- 组合成花朵造型
- 内置LED灯串装饰

### 4. 鸟喂食器
- 侧面开孔作为入口
- 底部填充鸟食
- 挂在树枝上吸引鸟类

### 5. 自动浇花器
- 瓶盖打小孔
- 倒置插入土壤
- 缓慢释放水分

### 6. 玩具制作
- 制作火箭、汽车模型
- 适合亲子手工活动
- 培养环保意识

### 7. 储物容器
- 分类储存豆类、谷物
- 透明瓶身便于识别
- 防潮防虫效果好

### 8. 艺术装置
- 收集不同颜色瓶子
- 制作大型艺术装置
- 传达环保理念

通过创意改造，我们不仅能减少塑料污染，还能创造美丽实用的物品！`,
      image_url: '/images/posts/plastic-bottle.jpg',
      category_id: categories[2].id,
      like_count: 38,
      view_count: 189,
      comment_count: 12,
      is_published: true,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: users[0].id,
      title: '太阳能发电系统入门指南',
      content: `太阳能是清洁能源的重要来源，本文将介绍家庭太阳能发电系统的入门知识：

## 太阳能系统组成

### 1. 太阳能电池板
- 将太阳光转化为电能
- 单晶硅、多晶硅等不同类型
- 选择适合家庭的尺寸和功率

### 2. 逆变器
- 将直流电转换为交流电
- 确保与家庭电网兼容
- 选择可靠的品牌和型号

### 3. 支架系统
- 屋顶安装或地面安装
- 考虑朝向和倾斜角度
- 确保结构安全稳固

### 4. 监控系统
- 实时监测发电效率
- 手机APP远程查看
- 故障预警功能

## 安装注意事项

### 1. 场地评估
- 确保充足的光照时间
- 评估屋顶承重能力
- 考虑阴影遮挡问题

### 2. 政策支持
- 了解当地补贴政策
- 申请并网许可
- 享受税收优惠

### 3. 维护保养
- 定期清洁面板表面
- 检查连接线路
- 监测发电效率

## 经济效益分析

### 1. 初始投资
- 系统设备费用
- 安装施工费用
- 审批许可费用

### 2. 长期收益
- 节省电费支出
- 余电上网收入
- 投资回收周期

通过太阳能发电，我们不仅能减少碳排放，还能获得经济收益！`,
      image_url: '/images/posts/solar-energy.jpg',
      category_id: categories[3].id,
      like_count: 31,
      view_count: 278,
      comment_count: 9,
      is_published: true,
      created_at: new Date(Date.now() - 345600000).toISOString(),
      updated_at: new Date(Date.now() - 345600000).toISOString()
    }
  ]

  return {
    users,
    profiles,
    categories,
    posts
  }
}

// 导出示例数据
export default generateSampleData