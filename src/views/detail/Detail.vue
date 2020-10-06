<template>
  <div id="detail">

    <detail-nav-bar class="detail-nav"
                    @titleClick="titleClick"
                    ref="nav"/>
    <scroll class="detail-content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">
      <ul>
        <li v-for="item in $store.state.cartList">
          {{item}}
        </li>
      </ul>
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info :param-info="paramInfo" ref="param"/>
      <detail-comment-info :comment-info="commentInfo" ref="comment"/>
      <goods-list :goods="recommends" ref="recommends"/>
    </scroll>
    <detail-bottom-bar @addToCart="addToCart"/>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
  </div>
</template>

<script>

import DetailNavBar from "./childComps/DetailNavBar";
import DetailSwiper from "./childComps/DetailSwiper";
import DetailBaseInfo from "./childComps/DetailBaseInfo";
import DetailShopInfo from "./childComps/DetailShopInfo";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
import DetailParamInfo from "./childComps/DetailParamInfo";
import DetailCommentInfo from "./childComps/DetailCommentInfo";
import DetailBottomBar from "./childComps/DetailBottomBar";
import BackTop from "../../components/content/backTop/BackTop";

import Scroll from "../../components/common/scroll/Scroll";
import GoodsList from "../../components/content/goods/GoodsList";

import {getDetail, getRecommend, Goods, Shop, GoodsParam} from "../../network/detail";
import {itemListenerMixin, backTopMixin} from "../../common/mixin"
import {debounce} from "../../common/utils";

export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    DetailBottomBar,
    // BackTop,
    Scroll,
    GoodsList
  },
  mixins: [
    itemListenerMixin,
    backTopMixin
  ],
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      themeTopYs: [],
      getThemeTopY: null,
      currentIndex: 0,
      // isShowBackTop: false,
      // isTabFixed: false,

    }
  },
  created() {
    //1、保存传入的iid
    this.iid = this.$route.params.iid

    //2、根据iid请求详情数据
    getDetail(this.iid).then(res => {
      // console.log(res);
      //1、获取顶部轮播图
      const data = res.data.result
      this.topImages = data.itemInfo.topImages

      //2、获取商品信息
      this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)

      //3、创建店铺信息
      this.shop = new Shop(data.shopInfo)

      //4、保存商品的详情数据
      this.detailInfo = data.detailInfo

      //5、获取参数信息
      this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

      //6、获取评论信息
      if (data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0]
      }

      this.$nextTick(() => {
        this.themeTopYs.push(0)
        this.themeTopYs.push(this.$refs.param.$el.offsetTop - 44)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop - 44)
        this.themeTopYs.push(this.$refs.recommends.$el.offsetTop - 44)
        this.themeTopYs.push(Number.MAX_VALUE)
        // console.log(this.themeTopYs);
      })

    })

    //3、请求推荐数据
    getRecommend().then(res => {
      this.recommends = res.data.data.list
    })

    //4、给getThemeTopY赋值
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = []
      this.themeTopYs.push(0)
      this.themeTopYs.push(this.$refs.param.$el.offsetTop - 44)
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop - 44)
      this.themeTopYs.push(this.$refs.recommends.$el.offsetTop - 44)
    }, 200)
  },
  methods: {
    imageLoad() {
      this.$refs.scroll.refresh()
      this.getThemeTopY()
      console.log('---');
    },
    titleClick(index) {
      this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200)
    },
    contentScroll(position) {
      //1、获取y值
      const positionY = -position.y

      //2、positionY和主题中值进行对比
      let length = this.themeTopYs.length
      // for(let i in this.themeTopYs) {
      for (let i = 0; i < length; i++) {
        // console.log(i);
        // console.log(this.themeTopYs);

        // if (positionY > this.themeTopYs[parseInt(i)] && positionY < this.themeTopYs[parseInt(i)+1]) {
        //   console.log(i);
        // }
        // if (this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[parseInt(i)] && positionY < this.themeTopYs[parseInt(i)+1])
        //   || (i === length -1 && positionY >= this.themeTopYs[parseInt(i)]))) {
        //   this.currentIndex = i
        //   this.$refs.nav.currentIndex = this.currentIndex
        // }
        if (this.currentIndex !== i && (positionY >= this.themeTopYs[i]
          && positionY < this.themeTopYs[i+1])) {
          this.currentIndex = i
          this.$refs.nav.currentIndex = this.currentIndex
          console.log(i);

        }
      }

      //是否显示回到顶部
      //判断BackTop是否显示
      this.isShowBackTop = (-position.y) > 1000;

      //决定tabControl是否吸顶（position：fixed）
      this.isTabFixed = (-position.y) > this.tabOffsetTop

    },
    // backClick() {
    //   this.$refs.scroll.scrollTo(0, 0, 500)
    // },
    addToCart() {
      //1、获取商品信息
      const product = {}
      product.image = this.topImages[0]
      product.title = this.goods.title
      product.desc = this.goods.desc
      product.price = this.goods.realPrice
      product.iid = this.iid

      //2、将商品添加至购物车
      // this.$store.cartList.push()
      // this.$store.commit('addCart', product)
      this.$store.dispatch('addCart', product)
    }
  },
  mounted() {

  },
  destroyed() {
    this.$bus.$off('itemImageLoad', this.itemImgListener)

  }
}
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .detail-content {
    height: calc(100% - 44px - 49px);
  }
</style>
