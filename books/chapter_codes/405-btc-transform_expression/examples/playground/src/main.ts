import { createApp, defineComponent, ref } from "chibivue";

const App = defineComponent({
  setup() {
    const count = ref(3);
    const getMsg = (count: number) => `Count: ${count}`;
    return { count, getMsg };
  },

  template: `
    <div class="container">
      <p> {{ 'Message is "' + getMsg(count) + '"'}} </p>
    </div>
  `,
});

const app = createApp(App);

app.mount("#app");
