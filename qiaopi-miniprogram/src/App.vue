<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  // 小程序启动入口；访问统计可在后端域名配置完成后接入。
})
</script>

<style>
page { background: #faf6f0; color: #342b25; font-family: "Songti SC", "STSong", serif; }
view, text, button, input, textarea { box-sizing: border-box; }
button::after { border: none; }
.page { min-height: 100vh; padding: 32rpx; }
.paper { background: #fffaf2; border: 1rpx solid #e8dac4; border-radius: 20rpx; box-shadow: 0 8rpx 24rpx rgba(87, 59, 32, .07); }
.page-title { font-size: 44rpx; font-weight: 700; text-align: center; color: #342b25; }
.page-subtitle { margin: 14rpx 0 40rpx; color: #806f5d; font-size: 27rpx; line-height: 1.7; text-align: center; }
.primary-btn, .secondary-btn { margin: 0; border-radius: 12rpx; font-size: 30rpx; line-height: 2.7; }
.primary-btn { background: #9c2f28; color: #fff; }
.secondary-btn { background: #f2e7d4; color: #6c4c38; }
.section-title { margin: 42rpx 0 20rpx; font-size: 35rpx; font-weight: 700; }
.tag { display: inline-block; padding: 5rpx 15rpx; margin: 0 10rpx 10rpx 0; color: #806f5d; font-size: 23rpx; background: #f4ebdd; border-radius: 100rpx; }
.muted { color: #927e6d; font-size: 26rpx; line-height: 1.75; }
</style>
