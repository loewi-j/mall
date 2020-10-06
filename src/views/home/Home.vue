<template>
  <div id="home" class="wrapper">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <tab-control :titles="['流行', '新款', '精选']"
                 @tabClick="tabClick"
                 ref="tabControl1"
                 class="tab-control" v-show="isTabFixed"/>
    <scroll class="content" ref="scroll"
            :probe-type="3"
            :pull-up-load="true"
            @scroll="contentScroll"
            @pullingUp="loadMore">
      <home-swiper :banners="banners"
                   @swiperImageLoad="swiperImageLoad"/>
      <recommend-view :recommends="recommends"/>
      <feature-view/>
      <tab-control :titles="['流行', '新款', '精选']"
                   @tabClick="tabClick"
                   ref="tabControl2"/>
      <goods-list :goods="showGoods"/>
    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>

  </div>

</template>

<script>
import HomeSwiper from "./childComps/HomeSwiper";
import RecommendView from "./childComps/RecommendView";
import FeatureView from "./childComps/FeatureView";

import NavBar from "components/common/navbar/NavBar";
import TabControl from "components/content/tabControl/TabControl";
import GoodsList from "../../components/content/goods/GoodsList";
import Scroll from "components/common/scroll/Scroll";
import BackTop from "../../components/content/backTop/BackTop";

import {
  getHomeMultidata,
  getHomeGoods
} from "network/home";
import {debounce} from "common/utils";
import {itemListenerMixin} from "../../common/mixin"


export default {
  name: "Home",
  components: {
    HomeSwiper,
    RecommendView,
    FeatureView,
    NavBar,
    TabControl,
    GoodsList,
    Scroll,
    BackTop
  },
  data() {
    return {
      // result: null,
      banners: [],
      recommends: [],
      goods: {
        'pop': {page: 0, list: []},
        'new': {page: 0, list: []},
        'sell': {page: 0, list: []}
      },
      currentType: 'pop',
      isShowBackTop: false,
      tabOffsetTop: 0,
      isTabFixed: false,
      saveY: 0,
      // itemImgListener: null
    }
  },
  mixins: [
    itemListenerMixin
  ],
  computed: {
    showGoods() {
      return this.goods[this.currentType].list
    }
  },
  activated() {
    this.$refs.scroll.scrollTo(0, this.saveY, 0)
    this.$refs.scroll.refresh()
  },
  deactivated() {
    //1、保存Y值
    this.saveY = this.$refs.scroll.getScrollY()

    //2、取消全局事件监听
    this.$bus.$off('itemImageLoad', this.itemImgListener)
  },
  created() {
    //1、请求多个数据
    this.getHomeMultidata()

    //2、请求商品数据
    this.getHomeGoods("pop")
    this.getHomeGoods("new")
    this.getHomeGoods("sell")

  },
  mounted() {
    //监听item中图片加载完成
    // const refresh = debounce(this.$refs.scroll.refresh, 200)
    //
    // //对监听的事件进行保存
    // this.itemImgListener = () => {
    //   refresh()
    // }
    // this.$bus.$on('itemImageLoad', this.itemImgListener)
    //   () => {
    //   // console.log('------');
    //   // this.$refs.scroll.refresh()
    //   // this.scroll && this.$refs.scroll.refresh()
    //   refresh()
    // })

  },
  methods: {
    /*
    * 事件监听相关方法
    * */
    tabClick(index) {
      switch (index) {
        case 0:
          this.currentType = 'pop';
          break;
        case 1:
          this.currentType = 'new';
          break;
        case 2:
          this.currentType = 'sell';
          break;
      }
      this.$refs.tabControl1.currentIndex = index
      this.$refs.tabControl2.currentIndex = index
    },
    backClick() {
      this.$refs.scroll.scrollTo(0, 0, 500)
    },
    contentScroll(position) {
      //判断BackTop是否显示
      this.isShowBackTop = (-position.y) > 1000;

      //决定tabControl是否吸顶（position：fixed）
      this.isTabFixed = (-position.y) > this.tabOffsetTop
    },
    loadMore() {
      // console.log('上拉加载');
      this.getHomeGoods(this.currentType)

      //刷新 重新计算滚动高度
      // this.$refs.scroll.scroll.refresh()
    },
    swiperImageLoad() {
      //获取tabControl的offsetTop
      this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop

    },

    /*
    * 网络请求相关方法
    * */
    getHomeMultidata() {
      getHomeMultidata().then(res => {
        // console.log(res);
        this.banners = res.data.data.banner.list;
        this.recommends = res.data.data.recommend.list;
      })
    },
    getHomeGoods(type) {
      const page = this.goods[type].page + 1
      getHomeGoods(type, page).then(res => {
        // console.log(res);
        this.goods[type].list.push(...res.data.data.list)
        this.goods[type].page += 1

        //完成上拉加载更多
        this.$refs.scroll.finishPullUp()
      })
    }

  }
}
</script>

<style scoped>
  #home {
    /*padding-top: 44px;*/
    height: 100vh;
  }

  .home-nav {
    background-color: var(--color-tint);
    color: #ffffff;

    /*原生滚动时使用*/
    /*position: fixed;*/
    /*left: 0;*/
    /*top: 0;*/
    /*right: 0;*/
    /*z-index: 9;*/
  }

  /*.tab-control {*/
  /*  position: sticky;*/
  /*  top: 43px;*/
  /*  z-index: 9;*/
  /*}*/
  .tab-control {
    /*相对定位*/
    position: relative;
    z-index: 9;

  }

  .content {
    /*height: 300px;*/
    overflow: hidden;
    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }

  /*.fixed {*/
  /*  position: fixed;*/
  /*  left: 0;*/
  /*  right: 0;*/
  /*  top: 44px;*/
  /*}*/

  /*.content {*/
  /*  height: calc(100% - 93px);*/
  /*  overflow: hidden;*/
  /*  margin-top: 50px;*/
  /*}*/
</style>
