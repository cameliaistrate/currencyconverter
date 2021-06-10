<template>
  <div class="mx-auto" style="max-width: 390px">
    <h1 class="m-3">Currency Converter</h1>
    <p>
      The Converter gets the currency rates from the European Central Bank. The
      rate for each currency is calculated against the Euro.
    </p>

    <b-input-group>
      <template #prepend>
        <b-input-group-text style="width: 60px">From</b-input-group-text>
      </template>
      <b-form-input type="number" v-model="amount1" required></b-form-input>

      <template #append>
        <b-form-select v-model="selected1" required style="height: 100%">
          <b-form-select-option :value="null" disabled
            >Select Currency</b-form-select-option
          >
          <b-form-select-option
            v-for="object in exchange"
            :key="object.currency"
            :value="object"
            >{{ object.currency }}</b-form-select-option
          >
        </b-form-select>
      </template>
    </b-input-group>
    <b-input-group>
      <template #prepend>
        <b-input-group-text style="width: 60px">To</b-input-group-text>
      </template>
      <b-form-input type="number" readonly v-model="amount2"></b-form-input>

      <template #append>
        <b-form-select v-model="selected2" style="height: 100%">
          <b-form-select-option :value="null" disabled
            >Select Currency</b-form-select-option
          >
          <b-form-select-option
            v-for="object in exchange"
            :key="object.currency"
            :value="object"
            >{{ object.currency }}</b-form-select-option
          >
        </b-form-select>
      </template>
    </b-input-group>
    <a
      :class="visible ? null : 'collapsed'"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse"
      @click="visible = !visible"
    >
      Decimal precision
    </a>
    <b-collapse id="collapse" v-model="visible" class="mt-2">
      <b-card>
        <b-row>
          <b-col>
            <p>
              Choose how many decimals your conversion's result should have.
            </p></b-col
          >
          <b-col cols="3"
            ><b-form-input type="number" v-model="decimals"></b-form-input
          ></b-col>
        </b-row>
        <b-form-checkbox
          id="checkbox"
          v-model="checkbox"
          name="checkbox"
          value="accepted"
          unchecked-value="not_accepted"
        >
          Save decimals number preference for the future
        </b-form-checkbox>
      </b-card>
    </b-collapse>
    <b-button
      @click="convert()"
      variant="primary"
      class="mt-3"
      style="width: 100%"
      >Convert</b-button
    >
    <b-alert :show="error !== null" variant="warning">{{ error }}</b-alert>
  </div>
</template>
<script>
var parseString = require("xml2js").parseString; // We need this for FETCH NO.1 - comment it out if you want to use FETCH NO.2

export default {
  data() {
    return {
      exchange: [], // This is where all the currencies and rates are loaded up. If Spanish pesetas make a comeback, they'll be here.
      selected1: null,
      selected2: null,
      amount1: 0,
      amount2: 0,
      error: null,
      visible: false,
      decimals: 2,
      checkbox: "not_accepted",
    };
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    checkbox: function (newAnswer, oldAnswer) {
      this.cookie();
    },
  },
  mounted() {
    // FETCH NO.1 - using xml2js parser and navigating the objects to get the necessary data
    this.axios.get("/stats/eurofxref/eurofxref-daily.xml").then((response) => {
      const self = this;
      parseString(response.data, function (err, result) {
        const exchange = result["gesmes:Envelope"].Cube[0].Cube[0].Cube;
        exchange.forEach((element) => {
          self.exchange.push(element["$"]);
        });
      });
    });
    // FETCH NO.2 - using DOMParser and targeting the nodes with the necessary attributes
    // Because there are 2 Cube nodes that are parents to those Cubes that contain the currency data, the currency/rate will come up null and they shouldn't get pushed to the data array

    // fetch("/stats/eurofxref/eurofxref-daily.xml").then((response) => {
    //   response.text().then((xml) => {
    //     const xmlContent = xml;
    //     var x, i, currency, rate;
    //     let parser = new DOMParser();
    //     let xmlDOM = parser.parseFromString(xmlContent, "application/xml");
    //     x = xmlDOM.getElementsByTagName("Cube");
    //     for (i = 0; i < x.length; i++) {
    //       currency = x[i].getAttribute("currency");
    //       rate = x[i].getAttribute("rate");
    //       if (currency !== null ) {
    //         this.exchange.push({ currency, rate });
    //       }
    //       console.log(currency);
    //       console.log(rate);
    //     }
    //   });
    // });
    this.exchange.push({ currency: "EUR", rate: "1" }); //Need to add EUR since it's not in the exchange rate feed

    // Check for cookies and retrieve them
    if (this.$cookies.isKey("decimals")) {
      this.decimals = this.$cookies.get("decimals");
      this.checkbox = this.$cookies.get("checkbox");
    }
  },
  methods: {
    convert() {
      if (this.selected1 == null || this.selected2 == null) {
        this.error = "Remember to make your currency selections!";
      } else {
        const rate1 = Number(this.selected1.rate);
        const rate2 = Number(this.selected2.rate);
        const result1 = this.amount1 / rate1;
        if (this.selected2.currency == "EUR") {
          this.amount2 = +result1.toFixed(this.decimals);
        } else {
          const result2 = result1 * rate2;
          this.amount2 = +result2.toFixed(this.decimals);
        }
        this.error = null;
      }
    },
    cookie() {
      if (this.checkbox == "accepted") {
        this.setCookie();
      } else {
        this.deleteCookie();
      }
    },
    setCookie() {
      this.$cookies
        .set("decimals", this.decimals, "10d")
        .set("checkbox", this.checkbox, "10d");
    },
    deleteCookie() {
      this.$cookies.remove("decimals").remove("checkbox");
    },
  },
};
</script>
<style scoped>
a {
  cursor: pointer;
}
</style>
