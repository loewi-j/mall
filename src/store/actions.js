export default {
  addCart(context, payload) {
    // let oldProduct = null
    // for (let item of state.cartList) {
    //   if (item.iid === payload.iid) {
    //     oldProduct = item
    //   }
    // }
    let oldProduct = context.state.cartList.find(item => item.iid === payload.iid)

    //判断
    if (oldProduct) {
      // oldProduct.count += 1
      context.commit('addCounter', oldProduct)
    }else {
      payload.count = 1
      // context.cartList.push(payload)
      context.commit('addToCart', payload)
    }
  }
}
