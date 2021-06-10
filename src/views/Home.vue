<template>
  <div class="home">
    <img alt="Exchange icon" src="../assets/exchange-icon.png" />
    <Converter />
  </div>
</template>

<script>
// @ is an alias to /src
import Converter from "@/components/Converter.vue";

export default {
  name: "Home",
  components: {
    Converter,
  },
};
</script>
