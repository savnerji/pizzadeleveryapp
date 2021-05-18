
const Order = require('../../../models/orders')
function orderController() {
    return {
        index(req, res) {

            console.log('ion controller');
            Order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate('customerId', '-password').exec((err, orders) => {
                if (req.xhr) {
                    return res.json(orders)
                } else {
                    return res.render('admin/orders')
                }
            })
        }
    }
}
module.exports = orderController