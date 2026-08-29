<template>
  <div className="cart-container">
    <h2>Shopping Cart</h2>
    <div v-for="item in items" :key="item.id">
      <span>{{ item.name }} - ${{ item.price }}</span>
      <button @click="incrementQuantity(item)">+</button>
      <button @click="decrementQuantity(item)">-</button>
    </div>
    <p>Total: ${{ cartTotal }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Widget A', price: 29.99, qty: 1 }
      ]
    };
  },
  computed: {
    cartTotal() {
      return this.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    }
  },
  methods: {
    incrementQuantity(item) {
      item.qty++;
    },
    decrementQuantity(item) {
      if (item.qty > 1) {
        item.qty--;
      }
    }
  }
};
</script>
