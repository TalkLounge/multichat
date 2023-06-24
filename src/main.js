import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"
import "bootstrap-icons/font/bootstrap-icons.css"
import axios from "axios"
import cheerio from "cheerio"

const app = createApp(App)

app.use(router)

app.config.globalProperties.$axios = axios;
app.config.globalProperties.$cheerio = cheerio;

app.mount("#app")

/*
Add GitHub Link in Corner & disable-github URL Paramater
Optimize for mobile & overflow-y: hidden
*/