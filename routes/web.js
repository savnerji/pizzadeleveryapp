
const homeController = require("../app/http/controllars/homeController");
const authController = require("../app/http/controllars/authController");
const cartController = require("../app/http/controllars/customers/cartController");
const orderController = require('../app/http/controllars/customers/orderController')
const adminOrderController = require('../app/http/controllars/admin/orderController')


const statusController = require('../app/http/controllars/admin/statusController')


// middlewares
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth') 
const admin = require('../app/http/middlewares/admin')
function ititRoutes(app) {


    
    app.get("/", homeController().index);

    app.get("/cart", cartController().index);


    app.get("/login", guest, authController().login)
    app.post("/login",  authController().postLogin)
    
    app.post("/logout",  authController().logout)

    app.get("/register",authController().register )
app.post("/register",authController().postRegister)

app.post('/update-cart',cartController().update)



//customner routes
app.post('/orders',auth,orderController().store) 
app.get('/customer/orders',auth,orderController().index)
app.get('/customer/orders/:id',auth,orderController().show)


//Admin routes

app.get('/admin/orders',admin,adminOrderController().index)
app.post('/admin/order/status',admin,statusController().update)
    
} 

module.exports= ititRoutes;

