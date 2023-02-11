import { createRouter, createWebHashHistory } from "vue-router"
import Home from "../views/Home.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/:pathMatch(.*)*",
      name: "home",
      component: Home
    },
    {
      path: "/:pathMatch(.*)",
      name: "home",
      component: Home
    },
  ]
})

export default router