
const Order = require('../../../models/orders')

function orderController() {

    return {
        store(req, res) {

            const { phone, address } = req.body

            //validate request
            if (!phone || !address) {
                req.flash('error', 'All fields are required')
            }


            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
            })

            //persist the data
            order.save().then(result => {


                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    req.flash('success', 'Order placed successfully')

                    delete req.session.cart

                    // Emit event 
                    const eventEmitter = req.app.get('eventEmitter') //here event is binding with the app server so we can found app in req and eventemitter in req
                    eventEmitter.emit('orderPlaced', placedOrder)

                    return res.redirect('/customer/orders')

                })


            }).catch(err => {
                req.flash('error', 'Something Went wrong')
                return res.redirect('/cart')
            })

        },


        async index(req, res) {

            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } })

            res.header('Cache-Control', 'no-store')

            res.render('customers/orders.ejs', { orders: orders })
            console.log(orders);
        },

        async show(req, res) {


            const order = await Order.findById(req.params.id)

            //Autherise user
            if (req.user._id.toString() === order.customerId.toString()) // in mongo db _ID is always a object we cant campare it with string so we want to convert it in string
            {
                return res.render('customers/singleOrder', { order: order })
            }

            return res.redirect('/')
        }
    }
}

module.exports = orderController