import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/chipfrom",
  meta: {
    icon: "ep/home-filled",
    title: $t("menus.pureHome"),
    rank: 0
  },
  children: [
    {
      path: "/chipfrom",
      name: "Chipfrom",
      component: () => import("@/views/chipfrom/index.vue"),
      meta: {
        title: "chipfrom",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    },
    {
      path: "/information",
      name: "Information",
      component: () => import("@/views/information/index.vue"),
      meta: {
        title: "information",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    },
    {
      path: "/users",
      name: "Users",
      component: () => import("@/views/users/index.vue"),
      meta: {
        title: "users",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    }
  ]
} satisfies RouteConfigsTable;
