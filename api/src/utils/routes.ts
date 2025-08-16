import Elysia from "elysia";
import authPlugin from "../components/auth/_plugin";
import userPlugin from "../components/users/_plugin";
import vendorPlugin from "../components/vendors/_plugin";
import menuRoutes from "../components/menu/controllers/menu.routes";
import adminPlugin from "../components/admin/_plugin";
import ordersRoutes from "../components/orders/controllers/orders.routes";
import cartRoutes from "../components/cart/controllers/cart.routes";
import favoritesRoutes from "../components/favorites/controllers/favorites.routes";
import notificationsPlugin from "../components/notification/_plugin";
import cronPlugin from "../components/jobs/_plugin";
import { verifyJobPlugin } from "../middleware/cron.middleware";

const routes = new Elysia()
    .get("/", () => "Server is up and running 🦊", { detail: { tags: ['Server Status'] } })
    .use(authPlugin)
    .use(adminPlugin)
    .use(userPlugin)
    .use(vendorPlugin)
    .use(menuRoutes)
    .use(ordersRoutes)
    .use(cartRoutes)
    .use(favoritesRoutes)
    .use(notificationsPlugin)
    .use(cronPlugin)
    // .use(verifyJobPlugin)


export default routes;