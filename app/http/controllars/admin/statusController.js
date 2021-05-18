
const Order =  require('../../../models/orders')

function statusController() {
    return {
        update(req, res) {
            Order.updateOne({_id: req.body.orderId}, { status: req.body.status }, (err, data)=> {
                if(err) {
                    return res.redirect('/admin/orders')
                }
                // Emit event 
                 const eventEmitter = req.app.get('eventEmitter') //here event is binding with the app server so we can found app in req and eventemitter in req
                 eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })
             return res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = statusController